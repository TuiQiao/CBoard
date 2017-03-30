package org.cboard.kylin;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.lang.StringUtils;
import org.cboard.cache.CacheManager;
import org.cboard.cache.HeapCacheManager;
import org.cboard.dataprovider.aggregator.Aggregatable;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.config.ValueConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.result.ColumnIndex;
import org.cboard.exception.CBoardException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthorizationInterceptor;
import org.springframework.web.client.RestTemplate;

import java.sql.*;
import java.util.*;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * Created by yfyuan on 2017/3/6.
 */
@ProviderName(name = "kylin")
public class KylinDataProvider extends DataProvider implements Aggregatable {

    private static final Logger LOG = LoggerFactory.getLogger(KylinDataProvider.class);

    @DatasourceParameter(label = "Kylin Server (domain:port)", type = DatasourceParameter.Type.Input, order = 1)
    private String SERVERIP = "serverIp";

    @DatasourceParameter(label = "User Name (for Kylin Server)", type = DatasourceParameter.Type.Input, order = 2)
    private String USERNAME = "username";

    @DatasourceParameter(label = "Password", type = DatasourceParameter.Type.Password, order = 3)
    private String PASSWORD = "password";

    @QueryParameter(label = "Kylin Project", type = QueryParameter.Type.Input)
    private String PROJECT = "project";

    @QueryParameter(label = "Data Model", type = QueryParameter.Type.Input)
    private String DATA_MODEL = "datamodel";

    private static final CacheManager<KylinModel> modelCache = new HeapCacheManager<>();

    private String getKey(Map<String, String> dataSource, Map<String, String> query) {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    @Override
    public String[][] getData() throws Exception {

        LOG.debug("Execute JdbcDataProvider.getData() Start!");
        KylinModel model = getModel();
        List<String[]> list = null;
        LOG.info("Model: " + model);

        try (Connection con = getConnection()) {
            Statement ps = con.createStatement();
            ResultSet rs = ps.executeQuery("select * from " + model.geModelSql());
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            list = new LinkedList<>();
            String[] row = new String[columnCount];
            for (int i = 0; i < columnCount; i++) {
                row[i] = metaData.getColumnLabel(i + 1);
            }
            list.add(row);
            while (rs.next()) {
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

        return list.toArray(new String[][]{});
    }

    private Connection getConnection() throws Exception {

        String username = dataSource.get(USERNAME);
        String password = dataSource.get(PASSWORD);
        Class.forName("org.apache.kylin.jdbc.Driver");
        Properties props = new Properties();
        props.setProperty("user", username);
        props.setProperty("password", password);
        return DriverManager.getConnection(String.format("jdbc:kylin://%s/%s", dataSource.get(SERVERIP), query.get(PROJECT)), props);
    }

    @Override
    public String[][] queryDimVals(String columnName, AggConfig config) throws Exception {
        String fsql = null;
        String exec = null;
        KylinModel model = getModel();
        List<String> filtered = new ArrayList<>();
        List<String> nofilter = new ArrayList<>();
        String tableName = model.getTable(columnName);
        String columnAliasName = model.getColumnAndAlias(columnName);

        if (config != null) {
            Stream<DimensionConfig> c = config.getColumns().stream();
            Stream<DimensionConfig> r = config.getRows().stream();
            Stream<DimensionConfig> f = config.getFilters().stream();
            Stream<DimensionConfig> filters = Stream.concat(Stream.concat(c, r), f);
            Stream<DimensionConfigHelper> filterHelpers = filters
                    //过滤掉其他维表
                    .filter(e -> tableName.equals(model.getTable(e.getColumnName())))
                    .map(fe -> new DimensionConfigHelper(fe, model.getColumnType(fe.getColumnName())));
            String whereStr = assembleSqlFilter(filterHelpers, "WHERE", model);

            fsql = "SELECT %s FROM %s %s %s GROUP BY %s ORDER BY %s";
            exec = String.format(fsql, columnAliasName, tableName, model.getTableAlias(tableName), whereStr, columnAliasName, columnAliasName);
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
        }
        fsql = "SELECT %s FROM %s %s GROUP BY %s ORDER BY %s";
        exec = String.format(fsql, columnAliasName, tableName, model.getTableAlias(tableName), columnAliasName, columnAliasName);
        LOG.info(exec);
        try (Connection connection = getConnection();
             Statement stat = connection.createStatement();
             ResultSet rs = stat.executeQuery(exec)) {
            while (rs.next()) {
                nofilter.add(rs.getString(1));
            }
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }
        return new String[][]{config == null ? nofilter.toArray(new String[]{}) : filtered.toArray(new String[]{}), nofilter.toArray(new String[]{})};
    }

    /**
     * Parser a single filter configuration to sql syntax
     */
    private BiFunction<DimensionConfigHelper, KylinModel, String> filter2SqlCondtion = (config, model) -> {
        if (config.getValues().size() == 0) {
            return null;
        }
        switch (config.getFilterType()) {
            case "=":
            case "eq":
                return model.getColumnAndAlias(config.getColumnName()) + " IN (" + IntStream.range(0, config.getValues().size()).boxed().map(i -> config.getValueStr(i)).collect(Collectors.joining(",")) + ")";
            case "≠":
            case "ne":
                return model.getColumnAndAlias(config.getColumnName()) + " NOT IN (" + IntStream.range(0, config.getValues().size()).boxed().map(i -> config.getValueStr(i)).collect(Collectors.joining(",")) + ")";
            case ">":
                return model.getColumnAndAlias(config.getColumnName()) + " > " + config.getValueStr(0);
            case "<":
                return model.getColumnAndAlias(config.getColumnName()) + " < " + config.getValueStr(0);
            case "≥":
                return model.getColumnAndAlias(config.getColumnName()) + " >= " + config.getValueStr(0);
            case "≤":
                return model.getColumnAndAlias(config.getColumnName()) + " <= " + config.getValueStr(0);
            case "(a,b]":
                if (config.getValues().size() >= 2) {
                    return "(" + model.getColumnAndAlias(config.getColumnName()) + " > '" + config.getValueStr(0) + "' AND " + model.getColumnAndAlias(config.getColumnName()) + " <= " + config.getValueStr(1) + ")";
                } else {
                    return null;
                }
            case "[a,b)":
                if (config.getValues().size() >= 2) {
                    return "(" + model.getColumnAndAlias(config.getColumnName()) + " >= " + config.getValueStr(0) + " AND " + model.getColumnAndAlias(config.getColumnName()) + " < " + config.getValueStr(1) + ")";
                } else {
                    return null;
                }
            case "(a,b)":
                if (config.getValues().size() >= 2) {
                    return "(" + model.getColumnAndAlias(config.getColumnName()) + " > " + config.getValueStr(0) + " AND " + model.getColumnAndAlias(config.getColumnName()) + " < " + config.getValueStr(1) + ")";
                } else {
                    return null;
                }
            case "[a,b]":
                if (config.getValues().size() >= 2) {
                    return "(" + model.getColumnAndAlias(config.getColumnName()) + " >= " + config.getValueStr(0) + " AND " + model.getColumnAndAlias(config.getColumnName()) + " <= " + config.getValueStr(1) + ")";
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
    private String assembleSqlFilter(Stream<DimensionConfigHelper> filterStream, String prefix, KylinModel model) {
        StringJoiner where = new StringJoiner("\nAND ", prefix + " ", "");
        where.setEmptyValue("");
        filterStream.map(s -> filter2SqlCondtion.apply(s, model)).filter(e -> e != null).forEach(where::add);
        return where.toString();
    }

    private String assembleAggValColumns(Stream<ValueConfig> selectStream, KylinModel model) {
        StringJoiner columns = new StringJoiner(", ", "", " ");
        columns.setEmptyValue("");
        selectStream.map(s -> toSelect.apply(s, model)).filter(e -> e != null).forEach(columns::add);
        return columns.toString();
    }

    private String assembleDimColumns(Stream<DimensionConfig> columnsStream, KylinModel model) {
        StringJoiner columns = new StringJoiner(", ", "", " ");
        columns.setEmptyValue("");
        columnsStream.map(g -> model.getColumnAndAlias(g.getColumnName())).distinct().filter(e -> e != null).forEach(columns::add);
        return columns.toString();
    }


    private KylinModel getModel() throws Exception {
        String modelName = query.get(DATA_MODEL);
        String serverIp = dataSource.get(SERVERIP);
        String username = dataSource.get(USERNAME);
        String password = dataSource.get(PASSWORD);

        String key = getKey(dataSource, query);
        KylinModel model = modelCache.get(key);
        if (model == null) {
            synchronized (key.intern()) {
                model = modelCache.get(key);
                if (model == null) {
                    RestTemplate restTemplate = new RestTemplate();
                    restTemplate.getInterceptors().add(new BasicAuthorizationInterceptor(username, password));
                    ResponseEntity<String> a = restTemplate.getForEntity("http://" + serverIp + "/kylin/api/model/{modelName}", String.class, modelName);
                    JSONObject jsonObject = JSONObject.parseObject(a.getBody());
                    model = new KylinModel(jsonObject, serverIp, username, password);
                    modelCache.put(key, model, 1 * 60 * 60 * 1000);
                }
            }
        }
        return model;
    }

    @Override
    public String[] getColumn() throws Exception {
        return getModel().getColumns();
    }

    @Override
    public AggregateResult queryAggData(AggConfig config) throws Exception {
        String exec = getQueryAggDataSql(dataSource, query, config);
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
        dimensionList.addAll(config.getValues().stream().map(ColumnIndex::fromValueConfig).collect(Collectors.toList()));
        IntStream.range(0, dimensionList.size()).forEach(j -> dimensionList.get(j).setIndex(j));
        String[][] result = list.toArray(new String[][]{});
        return new AggregateResult(dimensionList, result);
    }

    private String getQueryAggDataSql(Map<String, String> dataSource, Map<String, String> query, AggConfig config) throws Exception {
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<DimensionConfig> f = config.getFilters().stream();
        Stream<DimensionConfig> filters = Stream.concat(Stream.concat(c, r), f);
        KylinModel model = getModel();
        Stream<DimensionConfigHelper> predicates = filters.map(fe -> new DimensionConfigHelper(fe, model.getColumnType(fe.getColumnName())));
        Stream<DimensionConfig> dimStream = Stream.concat(config.getColumns().stream(), config.getRows().stream());

        String dimColsStr = assembleDimColumns(dimStream, model);
        String aggColsStr = assembleAggValColumns(config.getValues().stream(), model);
        String whereStr = assembleSqlFilter(predicates, "WHERE", model);
        String groupByStr = StringUtils.isBlank(dimColsStr) ? "" : "GROUP BY " + dimColsStr;

        StringJoiner selectColsStr = new StringJoiner(",");
        if (!StringUtils.isBlank(dimColsStr)) {
            selectColsStr.add(dimColsStr);
        }
        if (!StringUtils.isBlank(aggColsStr)) {
            selectColsStr.add(aggColsStr);
        }

        String fsql = "\nSELECT %s \nFROM %s\n %s \n %s";
        String exec = String.format(fsql, selectColsStr, model.geModelSql(), whereStr, groupByStr);
        return exec;
    }

    @Override
    public String viewAggDataQuery(AggConfig config) throws Exception {
        return getQueryAggDataSql(dataSource, query, config);
    }

    private BiFunction<ValueConfig, KylinModel, String> toSelect = (config, model) -> {
        switch (config.getAggType()) {
            case "sum":
                return "SUM(" + model.getColumnAndAlias(config.getColumn()) + ") AS sum_" + config.getColumn();
            case "avg":
                return "AVG(" + model.getColumnAndAlias(config.getColumn()) + ") AS avg_" + config.getColumn();
            case "max":
                return "MAX(" + model.getColumnAndAlias(config.getColumn()) + ") AS max_" + config.getColumn();
            case "min":
                return "MIN(" + model.getColumnAndAlias(config.getColumn()) + ") AS min_" + config.getColumn();
            case "distinct":
                return "COUNT(DISTINCT " + model.getColumnAndAlias(config.getColumn()) + ") AS count_d_" + config.getColumn();
            default:
                return "COUNT(" + model.getColumnAndAlias(config.getColumn()) + ") AS count_" + config.getColumn();
        }
    };

    private class DimensionConfigHelper extends DimensionConfig {
        private DimensionConfig config;
        private String type;

        public DimensionConfigHelper(DimensionConfig config, String type) {
            this.config = config;
            this.type = type;
        }

        public String getValueStr(int index) {
            if (type.startsWith("varchar")) {
                return "'" + getValues().get(index) + "'";
            } else {
                return getValues().get(index);
            }
        }

        @Override
        public String getColumnName() {
            return config.getColumnName();
        }

        @Override
        public void setColumnName(String columnName) {
            config.setColumnName(columnName);
        }

        @Override
        public String getFilterType() {
            return config.getFilterType();
        }

        @Override
        public void setFilterType(String filterType) {
            config.setFilterType(filterType);
        }

        @Override
        public List<String> getValues() {
            return config.getValues();
        }

        @Override
        public void setValues(List<String> values) {
            config.setValues(values);
        }

    }

    private class KylinModel {
        private JSONObject model;
        private Map<String, String> columnTable = new HashedMap();
        private Map<String, String> tableAlias = new HashedMap();
        private Map<String, String> columnType = new HashedMap();

        public String getColumnAndAlias(String column) {
            return tableAlias.get(columnTable.get(column)) + ".\"" + column + "\"";
        }

        public String getTable(String column) {
            return columnTable.get(column);
        }

        public String getTableAlias(String table) {
            return tableAlias.get(table);
        }

        private Map<String, String> getColumnsType(String table, String serverIp, String username, String password) {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.getInterceptors().add(new BasicAuthorizationInterceptor(username, password));
            ResponseEntity<String> a = restTemplate.getForEntity("http://" + serverIp + "/kylin/api/tables/{tableName}", String.class, table);
            JSONObject jsonObject = JSONObject.parseObject(a.getBody());
            Map<String, String> result = new HashedMap();
            jsonObject.getJSONArray("columns").stream().map(e -> (JSONObject) e).forEach(e -> result.put(e.getString("name"), e.getString("datatype")));
            return result;
        }

        public String getColumnType(String column) {
            return columnType.get(column);
        }

        public KylinModel(JSONObject model, String serverIp, String username, String password) throws Exception {
            if (model == null) {
                throw new CBoardException("Model not found");
            }
            this.model = model;
            model.getJSONArray("dimensions").forEach(e -> {
                        String t = ((JSONObject) e).getString("table");
                        Map<String, String> types = getColumnsType(t, serverIp, username, password);
                        types.entrySet().forEach(et -> columnType.put(et.getKey(), et.getValue()));
                        ((JSONObject) e).getJSONArray("columns").stream().map(c -> c.toString()).forEach(s -> {
                                    String alias = tableAlias.get(t);
                                    if (alias == null) {
                                        alias = "_t" + tableAlias.keySet().size() + 1;
                                        tableAlias.put(t, alias);
                                    }
                                    columnTable.put(s, t);
                                }
                        );
                    }
            );
            model.getJSONArray("metrics").stream().map(e -> e.toString()).forEach(s ->
                    {
                        String t = model.getString("fact_table");
                        String alias = tableAlias.get(t);
                        if (alias == null) {
                            alias = "_t" + tableAlias.keySet().size() + 1;
                            tableAlias.put(t, alias);
                        }
                        columnTable.put(s, t);
                    }
            );
        }

        public String geModelSql() {
            String factTable = model.getString("fact_table");
            return String.format("%s %s %s", factTable, tableAlias.get(factTable), getJoinSql(tableAlias.get(factTable)));
        }

        private String getJoinSql(String factAlias) {
            String s = model.getJSONArray("lookups").stream().map(e -> {
                JSONObject j = (JSONObject) e;
                String[] pk = j.getJSONObject("join").getJSONArray("primary_key").stream().map(p -> p.toString()).toArray(String[]::new);
                String[] fk = j.getJSONObject("join").getJSONArray("foreign_key").stream().map(p -> p.toString()).toArray(String[]::new);
                List<String> on = new ArrayList<>();
                for (int i = 0; i < pk.length; i++) {
                    on.add(String.format("%s.%s = %s.%s", tableAlias.get(j.getString("table")), pk[i], factAlias, fk[i]));
                }
                String type = j.getJSONObject("join").getString("type").toUpperCase();
                String pTable = j.getString("table");
                String onStr = on.stream().collect(Collectors.joining(" "));
                return String.format("\n %s JOIN %s %s ON %s", type, pTable, tableAlias.get(pTable), onStr);
            }).collect(Collectors.joining(" "));
            return s;
        }

        public String[] getColumns() {
            List<String> result = new ArrayList<>();
            model.getJSONArray("dimensions").forEach(e ->
                    ((JSONObject) e).getJSONArray("columns").stream().map(c -> c.toString()).forEach(result::add)
            );
            model.getJSONArray("metrics").stream().map(e -> e.toString()).forEach(result::add);
            return result.toArray(new String[0]);
        }
    }
}
