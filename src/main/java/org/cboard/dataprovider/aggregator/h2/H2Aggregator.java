package org.cboard.dataprovider.aggregator.h2;

import com.google.common.base.Stopwatch;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.dbcp2.BasicDataSource;
import org.cboard.dataprovider.aggregator.InnerAggregator;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.util.DPCommonUtils;
import org.cboard.dataprovider.util.SqlHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static org.cboard.dataprovider.util.SqlHelper.surround;

/**
 * Created by zyong on 2017/9/14.
 */
@Service
@Scope("prototype")
public class H2Aggregator extends InnerAggregator {

    private Logger LOG = LoggerFactory.getLogger(this.getClass());

    @Autowired
    @Qualifier("h2DataSource")
    private BasicDataSource jdbcDataSource;
    private static final String TBL_PREFIX = "TMP_";
    protected static Map<String, Long> h2AggMetaCacher = new HashMap<>();

    @Override
    public void beforeLoad(String[] header) {
        String tableName = getTmpTblName();
        StringJoiner ddl = new StringJoiner(", ", "CREATE TABLE " + tableName + "(", ");");
        Arrays.stream(header).map(col -> surround(col, "`") + " VARCHAR(255)").forEach(ddl::add);
        // Recreate table
        try (Connection conn = jdbcDataSource.getConnection();
             Statement statmt = conn.createStatement();) {
            String dropTableStr = "DROP TABLE IF EXISTS " + tableName;
            LOG.info("Execute: {}", dropTableStr);
            statmt.execute(dropTableStr);
            LOG.info("Execute: {}", ddl.toString());
            statmt.execute(ddl.toString());
        } catch (SQLException e) {
            LOG.error("", e);
        }
    }

    @Override
    public void loadBatch(String[] header, String[][] data) {
        Stopwatch stopwatch = Stopwatch.createStarted();
        final int batchSize = 20000;
        int count = 0;

        if (data != null && data.length > 0) {
            // Load data
            try (Connection conn = jdbcDataSource.getConnection();
                 PreparedStatement ps = conn.prepareStatement(buildPreparedStatment(header));
            ) {
                for (int i = 0; i < data.length; i++) {
                    for (int j = 1; j <= header.length; j++) {
                        ps.setString(j, data[i][j - 1]);
                    }
                    ps.addBatch();
                    if (++count % batchSize == 0) {
                        ps.executeBatch();
                        LOG.info("Thread id: {}, H2 load batch {}", Thread.currentThread().getName(), count);
                    }
                }
                ps.executeBatch();
            } catch (SQLException e) {
                LOG.error("", e);
            }
        }
        stopwatch.stop();
        LOG.info("H2 Database loadBatch using time: {} ms", stopwatch.elapsed(TimeUnit.MILLISECONDS));
    }

    @Override
    public void afterLoad() {
        h2AggMetaCacher.put(getTmpTblName(), System.currentTimeMillis());
    }

    private String buildPreparedStatment(String[] header) {
        String tableName = getTmpTblName();
        StringJoiner insertJoiner = new StringJoiner(", ", "INSERT INTO " + tableName + " VALUES (", ");");
        IntStream.range(0, header.length).forEach(i -> insertJoiner.add("?"));
        return insertJoiner.toString();
    }

    @Override
    public void loadData(String[][] data, long interval) {
        Stopwatch stopwatch = Stopwatch.createStarted();

        final int batchSize = 20000;
        int count = 0;

        if (data != null && data.length > 1) {
            String[] header = data[0];
            String tableName = getTmpTblName();
            beforeLoad(header);
            // Load data
            synchronized (tableName.intern()) {
                try (Connection conn = jdbcDataSource.getConnection();
                     PreparedStatement ps = conn.prepareStatement(buildPreparedStatment(header));
                ) {
                    for (int i = 1; i < data.length; i++) {
                        for (int j = 1; j <= data[i].length; j++) {
                            ps.setString(j, data[i][j - 1]);
                        }
                        ps.addBatch();
                        if (++count % batchSize == 0) {
                            ps.executeBatch();
                            LOG.info("H2 load batch {}", count);
                        }
                    }
                    ps.executeBatch();
                } catch (SQLException e) {
                    LOG.error("", e);
                }
            }
        }

        afterLoad();
        stopwatch.stop();
        LOG.info("H2 Database loading using time: {} ms", stopwatch.elapsed(TimeUnit.MILLISECONDS));
    }

    @Override
    public String[] queryDimVals(String columnName, AggConfig config) throws Exception {
        String fsql = "SELECT %s FROM %s %s GROUP BY %s";
        String exec = null;
        List<String> result = new ArrayList<>();
        String whereStr = "";
        if (config != null) {
            SqlHelper sqlHelper = new SqlHelper(getTmpTblName(), false);
            sqlHelper.setSqlSyntaxHelper(new H2SyntaxHelper());
            sqlHelper.getSqlSyntaxHelper().setColumnTypes(getColumnType());
            whereStr = sqlHelper.assembleFilterSql(config);
        }
        exec = String.format(fsql, surround(columnName, "`"), getTmpTblName(), whereStr, surround(columnName, "`"));
        LOG.info(exec);
        try (Connection conn = jdbcDataSource.getConnection();
             Statement stat = conn.createStatement();
             ResultSet rs = stat.executeQuery(exec)) {
            while (rs.next()) {
                result.add(rs.getString(1));
            }
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }
        return result.toArray(new String[]{});
    }

    @Override
    public String[] getColumn() throws Exception {
        String template = "SELECT column_name FROM INFORMATION_SCHEMA.columns WHERE table_name = upper('%s')";
        String colsQuery = String.format(template, getTmpTblName());
        List<String> columns = new ArrayList<>();
        try (Connection conn = jdbcDataSource.getConnection();
             Statement stat = conn.createStatement();
             ResultSet rs = stat.executeQuery(colsQuery)) {
            while (rs.next()) {
                String column = rs.getString("column_name");
                columns.add(column);
            }
        }
        return columns.toArray(new String[]{});
    }

    @Override
    public AggregateResult queryAggData(AggConfig config) throws Exception {
        Stopwatch stopwatch = Stopwatch.createStarted();
        SqlHelper sqlHelper = new SqlHelper(getTmpTblName(), false);
        sqlHelper.setSqlSyntaxHelper(new H2SyntaxHelper().setColumnTypes(getColumnType()));
        String exec = sqlHelper.assembleAggDataSql(config);

        List<String[]> list = new LinkedList<>();
        LOG.info(exec);
        ResultSet rs = null;
        try (
                Connection conn = jdbcDataSource.getConnection();
                Statement stat = conn.createStatement();
        ) {
            stat.execute("CREATE ALIAS IF NOT EXISTS f_todouble FOR \"org.cboard.dataprovider.aggregator.h2.Functions.parserString2Double\" ");
            rs = stat.executeQuery(exec);
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
        } finally {
            rs.close();
        }
        AggregateResult result = DPCommonUtils.transform2AggResult(config, list);
        LOG.info("H2 Database queryAggData using time: {} ms", stopwatch.elapsed(TimeUnit.MILLISECONDS));
        return result;
    }

    public boolean checkExist() {
        if (isTimeout() || !isTableExists()) {
            return false;
        } else {
            return true;
        }
    }

    private boolean isTimeout() {
        Long createTimeStamp = h2AggMetaCacher.get(getTmpTblName());
        if (createTimeStamp == null || System.currentTimeMillis() - createTimeStamp > (12 * 60 * 60 * 1000)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if the temporary table exists in h2 db
     *
     * @return
     */
    private boolean isTableExists() {
        boolean exists = false;
        String template = "SELECT count(*) FROM INFORMATION_SCHEMA.tables WHERE table_name = upper('%s')";
        String colsQuery = String.format(template, getTmpTblName());
        try (Connection conn = jdbcDataSource.getConnection();
             Statement stat = conn.createStatement();
             ResultSet rs = stat.executeQuery(colsQuery)
        ) {
            int count = 0;
            while (rs.next()) {
                count = rs.getInt(1);
            }
            if (count > 0) {
                exists = true;
            }
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
        }
        return exists;
    }

    private String getTmpTblName() {
        return TBL_PREFIX + getCacheKey();
    }

    private Map<String, Integer> getColumnType() throws Exception {
        Map<String, Integer> result = new HashedMap();
        String template = "SELECT column_name, type_name FROM INFORMATION_SCHEMA.columns WHERE table_name = upper('%s')";
        String colsQuery = String.format(template, getTmpTblName());
        try (Connection conn = jdbcDataSource.getConnection();
             Statement stat = conn.createStatement();
             ResultSet rs = stat.executeQuery(colsQuery)) {
            List<String> columns = new ArrayList<>();
            while (rs.next()) {
                String column = rs.getString("column_name");
                //String dataType = rs.getString("type_name");
                result.put(column, Types.VARCHAR);
            }
        }
        return result;
    }

}
