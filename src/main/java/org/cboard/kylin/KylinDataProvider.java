package org.cboard.kylin;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import org.cboard.cache.CacheManager;
import org.cboard.cache.HeapCacheManager;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.Initializing;
import org.cboard.dataprovider.aggregator.Aggregatable;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.config.ConfigComponent;
import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.util.DPCommonUtils;
import org.cboard.dataprovider.util.SqlHelper;
import org.cboard.kylin.model.KylinBaseModel;
import org.cboard.kylin.model.KylinModelFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.*;
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
    public static final String SERVERIP = "serverIp";

    @DatasourceParameter(label = "User Name (for Kylin Server) *",
            type = DatasourceParameter.Type.Input,
            required = true,
            order = 3)
    public static final String USERNAME = "username";

    @DatasourceParameter(label = "Password", type = DatasourceParameter.Type.Password, order = 4)
    public static final String PASSWORD = "password";

    // ----------- QueryParameter Start

    @QueryParameter(label = "Kylin Project *",
            type = QueryParameter.Type.Input,
            required = true)
    public static final String PROJECT = "project";

    @QueryParameter(label = "Data Model *", type = QueryParameter.Type.Input, required = true)
    public static final String DATA_MODEL = "datamodel";

    private static final CacheManager<KylinBaseModel> modelCache = new HeapCacheManager<>();

    private KylinBaseModel kylinModel;
    private SqlHelper sqlHelper;

    private String getKey(Map<String, String> dataSource, Map<String, String> query) {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    @Override
    public boolean doAggregationInDataSource() {
        return true;
    }

    @Override
    public String[][] getData() throws Exception {
        return null;
    }

    @Override
    public void test() throws Exception {
        LOG.debug("Execute Kylin DataProvider.test() Start!");
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
        String tableName = kylinModel.getTableOfColumn(columnName);
        String columnAliasName = kylinModel.getColumnWithAliasPrefix(columnName);
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
                            return tableName.equals(kylinModel.getTableOfColumn(dc.getColumnName()));
                        } else {
                            return true;
                        }
                    });
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

    private KylinBaseModel getModel(boolean reload) throws Exception {
        String key = getKey(dataSource, query);
        KylinBaseModel model = modelCache.get(key);
        if (model == null || reload) {
            synchronized (key.intern()) {
                model = modelCache.get(key);
                if (model == null || reload) {
                    model = KylinModelFactory.getKylinModel(dataSource, query);
                    modelCache.put(key, model, 1 * 60 * 60 * 1000);
                }
            }
        }
        return model;
    }

    @Override
    public String[] getColumn() throws Exception {
        return getModel(true).getColumns();
    }

    @Override
    public AggregateResult queryAggData(AggConfig config) throws Exception {
        String exec = sqlHelper.assembleAggDataSql(config);
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
        return DPCommonUtils.transform2AggResult(config, list);
    }

    @Override
    public String viewAggDataQuery(AggConfig config) throws Exception {
        return sqlHelper.assembleAggDataSql(config);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        try {
            kylinModel = getModel(false);
            sqlHelper = new SqlHelper(kylinModel.geModelSql(), false);
            sqlHelper.setSqlSyntaxHelper(new KylinSyntaxHelper(kylinModel));
        } catch (Exception e) {
            LOG.error("", e);
        }
    }

}