package org.cboard.dataprovider.aggregator.h2;

import com.google.common.base.Stopwatch;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.dbcp.BasicDataSource;
import org.cboard.cache.CacheManager;
import org.cboard.dataprovider.aggregator.InnerAggregator;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.result.ColumnIndex;
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
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.cboard.dataprovider.util.SqlHelper.*;
import static org.cboard.dataprovider.DataProvider.NULL_STRING;

/**
 * Created by zyong on 2017/9/14.
 */
@Service
@Scope("prototype")
public class H2Aggregator extends InnerAggregator {

    private Logger LOGGER = LoggerFactory.getLogger(this.getClass());

    @Autowired
    @Qualifier("h2DataSource")
    private BasicDataSource jdbcDataSource;
    private static final String TBL_PREFIX = "TMP_";
    protected static Map<String, Long> h2AggMetaCacher = new HashMap<>();

    @Override
    public void loadData(String[][] data, long interval) {
        Stopwatch stopwatch = Stopwatch.createStarted();
        final int batchSize = 20000;
        int count = 0;

        if (data != null && data.length > 1) {
            String[] header = data[0];
            String tableName = TBL_PREFIX + getCacheKey();
            StringJoiner ddlJoiner = new StringJoiner(", ", "CREATE TABLE " + tableName + "(", ");");
            Arrays.stream(header).map(col -> col + " VARCHAR(255)").forEach(ddlJoiner::add);

            StringJoiner insertJoiner = new StringJoiner(", ", "INSERT INTO " + tableName + " VALUES (", ");");
            IntStream.range(0, data[0].length).forEach(i -> insertJoiner.add("?"));

            synchronized (tableName.intern()) {
                // Recreate table
                try (Connection conn = jdbcDataSource.getConnection();
                     Statement statmt = conn.createStatement();) {
                    String dropTableStr = "DROP TABLE IF EXISTS " + tableName;
                    LOGGER.info("Execute: {}", dropTableStr);
                    statmt.execute(dropTableStr);
                    LOGGER.info("Execute: {}", ddlJoiner.toString());
                    statmt.execute(ddlJoiner.toString());
                } catch (SQLException e) {
                    e.printStackTrace();
                }

                // Load data
                try (Connection conn = jdbcDataSource.getConnection();
                     PreparedStatement ps = conn.prepareStatement(insertJoiner.toString());
                ) {
                    for (int i = 1; i < data.length; i++) {
                        for (int j = 1; j <= data[i].length; j++) {
                            ps.setString(j, data[i][j - 1]);
                        }
                        ps.addBatch();
                        if (++count % batchSize == 0) {
                            ps.executeBatch();
                            LOGGER.info("H2 load batch {}", count);
                        }
                    }
                    ps.executeBatch();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
        h2AggMetaCacher.put(getTmpTblName(), System.currentTimeMillis());
        stopwatch.stop();
        LOGGER.info("H2 Database loading using time: {} ms", stopwatch.elapsed(TimeUnit.MILLISECONDS));
    }

    @Override
    public String[] queryDimVals(String columnName, AggConfig config) throws Exception {
        String fsql = "SELECT %s FROM %s %s GROUP BY %s";
        String exec = null;
        List<String> result = new ArrayList<>();
        String whereStr = "";
        if (config != null) {
            whereStr = new SqlHelper(getTmpTblName(), getColumnType(), false).assembleFilterSql(config);
        }
        exec = String.format(fsql, surround(columnName, "`"), getTmpTblName(), whereStr, surround(columnName, "`"));
        LOGGER.info(exec);
        try (Connection conn = jdbcDataSource.getConnection();
             Statement stat = conn.createStatement();
             ResultSet rs = stat.executeQuery(exec)) {
            while (rs.next()) {
                result.add(rs.getString(1));
            }
        } catch (Exception e) {
            LOGGER.error("ERROR:" + e.getMessage());
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
        String exec = new SqlHelper(getTmpTblName(), getColumnType(), false).assembleAggDataSql(config);
        List<String[]> list = new LinkedList<>();
        LOGGER.info(exec);
        try (
                Connection conn = jdbcDataSource.getConnection();
                Statement stat = conn.createStatement();
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
            LOGGER.error("ERROR:" + e.getMessage());
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

        stopwatch.stop();
        LOGGER.info("H2 Database queryAggData using time: {} ms", stopwatch.elapsed(TimeUnit.MILLISECONDS));
        return new AggregateResult(dimensionList, result);
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
            LOGGER.error("ERROR:" + e.getMessage());
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
