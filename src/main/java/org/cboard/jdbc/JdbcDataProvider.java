package org.cboard.jdbc;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.pool.DruidDataSourceFactory;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.base.Stopwatch;
import com.google.common.hash.Hashing;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.lang.StringUtils;
import org.cboard.cache.CacheManager;
import org.cboard.cache.HeapCacheManager;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.Initializing;
import org.cboard.dataprovider.aggregator.Aggregatable;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.dataprovider.config.*;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.result.ColumnIndex;
import org.cboard.exception.CBoardException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * Created by yfyuan on 2016/8/17.
 */
@ProviderName(name = "jdbc")
public class JdbcDataProvider extends DataProvider implements Aggregatable, Initializing {

    private static final Logger LOG = LoggerFactory.getLogger(JdbcDataProvider.class);

    @Value("${dataprovider.resultLimit:200000}")
    private int resultLimit;

    @DatasourceParameter(label = "{{'DATAPROVIDER.JDBC.DRIVER'|translate}} *",
            type = DatasourceParameter.Type.Input,
            required = true,
            order = 1)
    private String DRIVER = "driver";

    @DatasourceParameter(label = "{{'DATAPROVIDER.JDBC.JDBCURL'|translate}} *",
            type = DatasourceParameter.Type.Input,
            required = true,
            order = 2)
    private String JDBC_URL = "jdbcurl";

    @DatasourceParameter(label = "{{'DATAPROVIDER.JDBC.USERNAME'|translate}} *",
            type = DatasourceParameter.Type.Input,
            required = true,
            order = 3)
    private String USERNAME = "username";

    @DatasourceParameter(label = "{{'DATAPROVIDER.JDBC.PASSWORD'|translate}}",
            type = DatasourceParameter.Type.Password,
            order = 4)
    private String PASSWORD = "password";

    @DatasourceParameter(label = "{{'DATAPROVIDER.POOLEDCONNECTION'|translate}}", checked = true, type = DatasourceParameter.Type.Checkbox, order = 5)
    private String POOLED = "pooled";

    @DatasourceParameter(label = "{{'DATAPROVIDER.AGGREGATABLE_PROVIDER'|translate}}", type = DatasourceParameter.Type.Checkbox, order = 100)
    private String aggregateProvider = "aggregateProvider";

    @QueryParameter(label = "{{'DATAPROVIDER.JDBC.SQLTEXT'|translate}}",
            type = QueryParameter.Type.TextArea,
            required = true,
            order = 1)
    private String SQL = "sql";

    private static final CacheManager<Map<String, Integer>> typeCahce = new HeapCacheManager<>();

    private static final ConcurrentMap<String, DataSource> datasourceMap = new ConcurrentHashMap<>();

    private DimensionConfigHelper dimensionConfigHelper;

    @Override
    public boolean doAggregationInDataSource() {
        String v = dataSource.get(aggregateProvider);
        return v != null && "true".equals(v);
    }

    private String getKey() {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    @Override
    public String[][] getData() throws Exception {
        Stopwatch stopwatch = Stopwatch.createStarted();
        LOG.debug("Execute JdbcDataProvider.getData() Start!");
        String sql = getAsSubQuery(query.get(SQL));
        List<String[]> list = null;
        LOG.info("SQL String: " + sql);

        try (Connection con = getConnection()) {
            Statement ps = con.createStatement();
            ResultSet rs = ps.executeQuery(sql);
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            list = new LinkedList<>();
            String[] row = new String[columnCount];
            for (int i = 0; i < columnCount; i++) {
                row[i] = metaData.getColumnLabel(i + 1);
            }
            list.add(row);
            int resultCount = 0;
            while (rs.next()) {
                resultCount++;
                if (resultCount > resultLimit) {
                    throw new CBoardException("Cube result count is greater than limit " + resultLimit);
                }
                row = new String[columnCount];
                for (int j = 0; j < columnCount; j++) {
                    row[j] = rs.getString(j + 1);
                }
                list.add(row);
            }
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }
        stopwatch.stop();
        LOG.info("getData() using time: {} ms", stopwatch.elapsed(TimeUnit.MILLISECONDS));
        return list.toArray(new String[][]{});
    }

    /**
     * Convert the sql text to subquery string:
     * remove blank line
     * remove end semicolon ;
     *
     * @param rawQueryText
     * @return
     */
    private String getAsSubQuery(String rawQueryText) {
        String deletedBlankLine = rawQueryText.replaceAll("(?m)^[\\s\t]*\r?\n", "").trim();
        return deletedBlankLine.endsWith(";") ? deletedBlankLine.substring(0, deletedBlankLine.length() - 1) : deletedBlankLine;
    }

    private Connection getConnection() throws Exception {
        String usePool = dataSource.get(POOLED);
        String username = dataSource.get(USERNAME);
        String password = dataSource.get(PASSWORD);
        Connection conn = null;
        if (usePool != null && "true".equals(usePool)) {
            String key = Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString(), Charsets.UTF_8).hash().toString();
            DataSource ds = datasourceMap.get(key);
            if (ds == null) {
                synchronized (key.intern()) {
                    ds = datasourceMap.get(key);
                    if (ds == null) {
                        Map<String, String> conf = new HashedMap();
                        conf.put(DruidDataSourceFactory.PROP_DRIVERCLASSNAME, dataSource.get(DRIVER));
                        conf.put(DruidDataSourceFactory.PROP_URL, dataSource.get(JDBC_URL));
                        conf.put(DruidDataSourceFactory.PROP_USERNAME, dataSource.get(USERNAME));
                        if (StringUtils.isNotBlank(password)) {
                            conf.put(DruidDataSourceFactory.PROP_PASSWORD, dataSource.get(PASSWORD));
                        }
                        conf.put(DruidDataSourceFactory.PROP_INITIALSIZE, "3");
                        DruidDataSource druidDS = (DruidDataSource) DruidDataSourceFactory.createDataSource(conf);
                        druidDS.setBreakAfterAcquireFailure(true);
                        druidDS.setConnectionErrorRetryAttempts(5);
                        datasourceMap.put(key, druidDS);
                        ds = datasourceMap.get(key);
                    }
                }
            }
            try {
                conn = ds.getConnection();
            } catch (SQLException e) {
                e.printStackTrace();
                datasourceMap.remove(key);
                throw e;
            }
            return conn;
        } else {
            String driver = dataSource.get(DRIVER);
            String jdbcurl = dataSource.get(JDBC_URL);

            Class.forName(driver);
            Properties props = new Properties();
            props.setProperty("user", username);
            if (StringUtils.isNotBlank(password)) {
                props.setProperty("password", password);
            }
            return DriverManager.getConnection(jdbcurl, props);
        }
    }

    @Override
    public String[] queryDimVals(String columnName, AggConfig config) throws Exception {
        String fsql = null;
        String exec = null;
        String sql = getAsSubQuery(query.get(SQL));
        List<String> filtered = new ArrayList<>();
        String whereStr = "";
        if (config != null) {
            Stream<DimensionConfig> c = config.getColumns().stream();
            Stream<DimensionConfig> r = config.getRows().stream();
            Stream<ConfigComponent> f = config.getFilters().stream();
            Stream<ConfigComponent> filters = Stream.concat(Stream.concat(c, r), f);
            whereStr = assembleSqlFilter(filters, "WHERE");
        }
        fsql = "SELECT cb_view.%s FROM (\n%s\n) cb_view %s GROUP BY cb_view.%s";
        exec = String.format(fsql, columnName, sql, whereStr, columnName);
        LOG.info(exec);
        try (Connection connection = getConnection();
             Statement stat = connection.createStatement();
             ResultSet rs = stat.executeQuery(exec)) {
            while (rs.next()) {
                filtered.add(rs.getString(1));
            }
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }
        return filtered.toArray(new String[]{});
    }

    private String configComponentToSql(ConfigComponent cc) {
        if (cc instanceof DimensionConfig) {
            return filter2SqlCondtion.apply((DimensionConfig) cc);
        } else if (cc instanceof CompositeConfig) {
            CompositeConfig compositeConfig = (CompositeConfig) cc;
            String sql = compositeConfig.getConfigComponents().stream().map(e -> separateNull(e)).map(e -> configComponentToSql(e)).collect(Collectors.joining(" " + compositeConfig.getType() + " "));
            return "(" + sql + ")";
        }
        return null;
    }

    /**
     * Parser a single filter configuration to sql syntax
     */
    private Function<DimensionConfig, String> filter2SqlCondtion = (config) -> {
        if (config.getValues().size() == 0) {
            return null;
        }
        if (NULL_STRING.equals(config.getValues().get(0))) {
            switch (config.getFilterType()) {
                case "=":
                case "≠":
                    return config.getColumnName() + ("=".equals(config.getFilterType()) ? " IS NULL" : " IS NOT NULL");
            }
        }

        switch (config.getFilterType()) {
            case "=":
            case "eq":
                return config.getColumnName() + " IN (" + IntStream.range(0, config.getValues().size()).boxed().map(i -> dimensionConfigHelper.getValueStr(config, i)).collect(Collectors.joining(",")) + ")";
            case "≠":
            case "ne":
                return config.getColumnName() + " NOT IN (" + IntStream.range(0, config.getValues().size()).boxed().map(i -> dimensionConfigHelper.getValueStr(config, i)).collect(Collectors.joining(",")) + ")";
            case ">":
                return config.getColumnName() + " > " + dimensionConfigHelper.getValueStr(config, 0);
            case "<":
                return config.getColumnName() + " < " + dimensionConfigHelper.getValueStr(config, 0);
            case "≥":
                return config.getColumnName() + " >= " + dimensionConfigHelper.getValueStr(config, 0);
            case "≤":
                return config.getColumnName() + " <= " + dimensionConfigHelper.getValueStr(config, 0);
            case "(a,b]":
                if (config.getValues().size() >= 2) {
                    return "(" + config.getColumnName() + " > '" + dimensionConfigHelper.getValueStr(config, 0) + "' AND " + config.getColumnName() + " <= " + dimensionConfigHelper.getValueStr(config, 1) + ")";
                } else {
                    return null;
                }
            case "[a,b)":
                if (config.getValues().size() >= 2) {
                    return "(" + config.getColumnName() + " >= " + dimensionConfigHelper.getValueStr(config, 0) + " AND " + config.getColumnName() + " < " + dimensionConfigHelper.getValueStr(config, 1) + ")";
                } else {
                    return null;
                }
            case "(a,b)":
                if (config.getValues().size() >= 2) {
                    return "(" + config.getColumnName() + " > " + dimensionConfigHelper.getValueStr(config, 0) + " AND " + config.getColumnName() + " < " + dimensionConfigHelper.getValueStr(config, 1) + ")";
                } else {
                    return null;
                }
            case "[a,b]":
                if (config.getValues().size() >= 2) {
                    return "(" + config.getColumnName() + " >= " + dimensionConfigHelper.getValueStr(config, 0) + " AND " + config.getColumnName() + " <= " + dimensionConfigHelper.getValueStr(config, 1) + ")";
                } else {
                    return null;
                }
        }
        return null;
    };

    /**
     * Assemble all the filter to a legal sal where script
     *
     * @param filterStream
     * @param prefix       HAVING or WHERE
     * @return
     */
    private String assembleSqlFilter(Stream<ConfigComponent> filterStream, String prefix) {
        StringJoiner where = new StringJoiner("\nAND ", prefix + " ", "");
        where.setEmptyValue("");
        filterStream.map(e -> separateNull(e)).map(e -> configComponentToSql(e)).filter(e -> e != null).forEach(where::add);
        return where.toString();
    }

    private String assembleAggValColumns(Stream<ValueConfig> selectStream, Map<String, Integer> types) {
        StringJoiner columns = new StringJoiner(", ", "", " ");
        columns.setEmptyValue("");
        selectStream.map(m -> toSelect.apply(m, types)).filter(e -> e != null).forEach(columns::add);
        return columns.toString();
    }

    private String assembleDimColumns(Stream<DimensionConfig> columnsStream) {
        StringJoiner columns = new StringJoiner(", ", "", " ");
        columns.setEmptyValue("");
        columnsStream.map(g -> g.getColumnName()).distinct().filter(e -> e != null).forEach(columns::add);
        return columns.toString();
    }

    private ResultSetMetaData getMetaData(String subQuerySql, Statement stat) throws Exception {
        ResultSetMetaData metaData;
        try {
            stat.setMaxRows(100);
            String fsql = "\nSELECT * FROM (\n%s\n) cb_view WHERE 1=0";
            String sql = String.format(fsql, subQuerySql);
            LOG.info(sql);
            ResultSet rs = stat.executeQuery(sql);
            metaData = rs.getMetaData();
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }
        return metaData;
    }

    private Map<String, Integer> getColumnType() throws Exception {
        Map<String, Integer> result = null;
        String key = getKey();
        result = typeCahce.get(key);
        if (result != null) {
            return result;
        } else {
            try (
                    Connection connection = getConnection();
                    Statement stat = connection.createStatement()
            ) {
                String subQuerySql = getAsSubQuery(query.get(SQL));
                ResultSetMetaData metaData = getMetaData(subQuerySql, stat);
                int columnCount = metaData.getColumnCount();
                result = new HashedMap();
                for (int i = 0; i < columnCount; i++) {
                    result.put(metaData.getColumnLabel(i + 1), metaData.getColumnType(i + 1));
                }
                typeCahce.put(key, result, 12 * 60 * 60 * 1000);
                return result;
            }
        }
    }

    @Override
    public String[] getColumn() throws Exception {
        String subQuerySql = getAsSubQuery(query.get(SQL));
        try (
                Connection connection = getConnection();
                Statement stat = connection.createStatement()
        ) {
            ResultSetMetaData metaData = getMetaData(subQuerySql, stat);
            int columnCount = metaData.getColumnCount();
            String[] row = new String[columnCount];
            for (int i = 0; i < columnCount; i++) {
                row[i] = metaData.getColumnLabel(i + 1);
            }
            return row;
        }
    }

    @Override
    public AggregateResult queryAggData(AggConfig config) throws Exception {
        String exec = getQueryAggDataSql(config);
        List<String[]> list = new LinkedList<>();
        LOG.info(exec);
        try (
                Connection connection = getConnection();
                Statement stat = connection.createStatement();
                ResultSet rs = stat.executeQuery(exec)
        ) {
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            while (rs.next()) {
                String[] row = new String[columnCount];
                for (int j = 0; j < columnCount; j++) {
                    row[j] = rs.getString(j + 1);
                }
                list.add(row);
            }
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }

        // recreate a dimension stream
        Stream<DimensionConfig> dimStream = Stream.concat(config.getColumns().stream(), config.getRows().stream());
        List<ColumnIndex> dimensionList = dimStream.map(ColumnIndex::fromDimensionConfig).collect(Collectors.toList());
        int dimSize = dimensionList.size();
        dimensionList.addAll(config.getValues().stream().map(ColumnIndex::fromValueConfig).collect(Collectors.toList()));
        IntStream.range(0, dimensionList.size()).forEach(j -> dimensionList.get(j).setIndex(j));
        list.forEach(row -> {
            IntStream.range(0, dimSize).forEach(i -> {
                if (row[i] == null) row[i] = NULL_STRING;
            });
        });
        String[][] result = list.toArray(new String[][]{});
        return new AggregateResult(dimensionList, result);
    }

    private String getQueryAggDataSql(AggConfig config) throws Exception {
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<ConfigComponent> f = config.getFilters().stream();
        Stream<ConfigComponent> filters = Stream.concat(Stream.concat(c, r), f);
        Map<String, Integer> types = getColumnType();
        Stream<DimensionConfig> dimStream = Stream.concat(config.getColumns().stream(), config.getRows().stream());

        String dimColsStr = assembleDimColumns(dimStream);
        String aggColsStr = assembleAggValColumns(config.getValues().stream(), types);
        String whereStr = assembleSqlFilter(filters, "WHERE");
        String groupByStr = StringUtils.isBlank(dimColsStr) ? "" : "GROUP BY " + dimColsStr;

        StringJoiner selectColsStr = new StringJoiner(",");
        if (!StringUtils.isBlank(dimColsStr)) {
            selectColsStr.add(dimColsStr);
        }
        if (!StringUtils.isBlank(aggColsStr)) {
            selectColsStr.add(aggColsStr);
        }

        String subQuerySql = getAsSubQuery(query.get(SQL));
        String fsql = "\nSELECT %s \n FROM (\n%s\n) cb_view \n %s \n %s";
        String exec = String.format(fsql, selectColsStr, subQuerySql, whereStr, groupByStr);
        return exec;
    }

    @Override
    public String viewAggDataQuery(AggConfig config) throws Exception {
        return getQueryAggDataSql(config);
    }

    private BiFunction<ValueConfig, Map<String, Integer>, String> toSelect = (config, types) -> {
        String aggExp;
        if (config.getColumn().contains(" ")) {
            aggExp = config.getColumn();
            for (String column : types.keySet()) {
                aggExp = aggExp.replaceAll(" " + column + " ", " cb_view." + column + " ");
            }
        } else {
            aggExp = "cb_view." + config.getColumn();
        }
        switch (config.getAggType()) {
            case "sum":
                return "SUM(" + aggExp + ")";
            case "avg":
                return "AVG(" + aggExp + ")";
            case "max":
                return "MAX(" + aggExp + ")";
            case "min":
                return "MIN(" + aggExp + ")";
            case "distinct":
                return "COUNT(DISTINCT " + aggExp + ")";
            default:
                return "COUNT(" + aggExp + ")";
        }
    };

    @Override
    public void afterPropertiesSet() throws Exception {
        try {
            dimensionConfigHelper = new DimensionConfigHelper();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private class DimensionConfigHelper {
        private Map<String, Integer> types = getColumnType();

        private DimensionConfigHelper() throws Exception {
        }

        public String getValueStr(DimensionConfig dc, int index) {
            switch (types.get(dc.getColumnName())) {
                case Types.VARCHAR:
                case Types.CHAR:
                case Types.NVARCHAR:
                case Types.NCHAR:
                case Types.CLOB:
                case Types.NCLOB:
                case Types.LONGVARCHAR:
                case Types.LONGNVARCHAR:
                case Types.DATE:
                case Types.TIMESTAMP:
                case Types.TIMESTAMP_WITH_TIMEZONE:
                    return "'" + dc.getValues().get(index) + "'";
                default:
                    return dc.getValues().get(index);
            }
        }

    }
}
