package org.cboard.kylin;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
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
import org.cboard.dataprovider.util.SqlHelper;
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
public class KylinDataProvider extends DataProvider implements Aggregatable, Initializing {

    private static final Logger LOG = LoggerFactory.getLogger(KylinDataProvider.class);

    @DatasourceParameter(label = "Kylin Server *",
            type = DatasourceParameter.Type.Input,
            required = true,
            value = "domain:port",
            placeholder = "domain:port",
            order = 1)
    private String SERVERIP = "serverIp";

    @DatasourceParameter(label = "User Name (for Kylin Server) *",
            type = DatasourceParameter.Type.Input,
            required = true,
            order = 2)
    private String USERNAME = "username";

    @DatasourceParameter(label = "Password", type = DatasourceParameter.Type.Password, order = 3)
    private String PASSWORD = "password";

    @QueryParameter(label = "Kylin Project *",
            type = QueryParameter.Type.Input,
            required = true)
    private String PROJECT = "project";

    @QueryParameter(label = "Data Model *", type = QueryParameter.Type.Input, required = true)
    private String DATA_MODEL = "datamodel";

    private static final CacheManager<KylinModel> modelCache = new HeapCacheManager<>();

    private KylinModel kylinModel;


    private String getKey(Map<String, String> dataSource, Map<String, String> query) {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    @Override
    public boolean doAggregationInDataSource() {
        return true;
    }

    @Override
    public String[][] getData() throws Exception {

        LOG.debug("Execute JdbcDataProvider.getData() Start!");
        List<String[]> list = null;
        LOG.info("Model: " + kylinModel);

        try (Connection con = getConnection()) {
            Statement ps = con.createStatement();
            ResultSet rs = ps.executeQuery("select * from " + kylinModel.geModelSql() + " limit 10");
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
    public String[] queryDimVals(String columnName, AggConfig config) throws Exception {
        String fsql = null;
        String exec = null;
        List<String> filtered = new ArrayList<>();
        String tableName = kylinModel.getTable(columnName);
        String columnAliasName = kylinModel.getColumnAndAlias(columnName);
        String whereStr = "";
        if (config != null) {
            Stream<DimensionConfig> c = config.getColumns().stream();
            Stream<DimensionConfig> r = config.getRows().stream();
            Stream<ConfigComponent> f = config.getFilters().stream();
            Stream<ConfigComponent> filters = Stream.concat(Stream.concat(c, r), f);
            Stream<ConfigComponent> filterHelpers = filters
                    //过滤掉其他维表
                    .filter(e -> {
                        if (e instanceof DimensionConfig) {
                            DimensionConfig dc = (DimensionConfig) e;
                            return tableName.equals(kylinModel.getTable(dc.getColumnName()));
                        } else {
                            return true;
                        }
                    });
            SqlHelper sqlHelper = new SqlHelper();
            sqlHelper.setValuesStr(valuesStr).setSqlSyntaxHelper(new KylinSyntaxHelper(kylinModel));
            whereStr =  sqlHelper.assembleFilterSql(filterHelpers);
        }
        fsql = "SELECT %s FROM %s %s %s GROUP BY %s ORDER BY %s";
        exec = String.format(fsql, columnAliasName, tableName, kylinModel.getTableAlias(tableName), whereStr, columnAliasName, columnAliasName);
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

    private BiFunction<DimensionConfig, Integer, String> valuesStr = (config, index) -> {
        if (kylinModel.getColumnType(config.getColumnName()).startsWith("varchar")) {
            return "'" + config.getValues().get(index) + "'";
        } else {
            return config.getValues().get(index);
        }
    };

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

        SqlHelper sqlHelper = new SqlHelper();
        sqlHelper.setValuesStr(valuesStr);

        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<ConfigComponent> f = config.getFilters().stream();
        Stream<ConfigComponent> filters = Stream.concat(Stream.concat(c, r), f);
        KylinModel model = getModel();
        Stream<DimensionConfig> dimStream = Stream.concat(config.getColumns().stream(), config.getRows().stream());

        String dimColsStr = assembleDimColumns(dimStream, model);
        String aggColsStr = assembleAggValColumns(config.getValues().stream(), model);

        String whereStr =  sqlHelper.assembleFilterSql(filters);
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
        return getQueryAggDataSql(config);
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

    @Override
    public void afterPropertiesSet() throws Exception {
        try {
            kylinModel = getModel();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getValueStr(DimensionConfig config, int index) {
        if (kylinModel.getColumnType(config.getColumnName()).startsWith("varchar")) {
            return "'" + config.getValues().get(index) + "'";
        } else {
            return config.getValues().get(index);
        }
    }

}
