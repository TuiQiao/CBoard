package org.cboard.jdbc;

import org.apache.commons.lang.StringUtils;
import org.cboard.dataprovider.AggregateProvider;
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
import org.springframework.beans.factory.annotation.Value;

import java.sql.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * Created by yfyuan on 2016/8/17.
 */
@ProviderName(name = "jdbc")
public class JdbcDataProvider extends DataProvider implements AggregateProvider {

    private static final Logger LOG = LoggerFactory.getLogger(JdbcDataProvider.class);

    @Value("${dataprovider.resultLimit:200000}")
    private int resultLimit;

    @DatasourceParameter(label = "Driver (eg: com.mysql.jdbc.Driver)", type = DatasourceParameter.Type.Input, order = 1)
    private String DRIVER = "driver";

    @DatasourceParameter(label = "JDBC Url (eg: jdbc:mysql://hostname:port/db)", type = DatasourceParameter.Type.Input, order = 2)
    private String JDBC_URL = "jdbcurl";

    @DatasourceParameter(label = "User Name", type = DatasourceParameter.Type.Input, order = 3)
    private String USERNAME = "username";

    @DatasourceParameter(label = "Password", type = DatasourceParameter.Type.Password, order = 4)
    private String PASSWORD = "password";

    @QueryParameter(label = "SQL TEXT", type = QueryParameter.Type.TextArea, order = 1)
    private String SQL = "sql";

    public String[][] getData(Map<String, String> dataSource, Map<String, String> query) throws Exception {

        LOG.debug("Execute JdbcDataProvider.getData() Start!");
        String sql = query.get(SQL);
        List<String[]> list = null;
        LOG.info("SQL String: " + sql);

        try (Connection con = getConnection(dataSource)) {
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

        return list.toArray(new String[][]{});
    }

    private Connection getConnection(Map<String, String> dataSource) throws Exception {
        String driver = dataSource.get(DRIVER);
        String jdbcurl = dataSource.get(JDBC_URL);
        String username = dataSource.get(USERNAME);
        String password = dataSource.get(PASSWORD);

        Class.forName(driver);
        Properties props = new Properties();
        props.setProperty("user", username);
        props.setProperty("password", password);
        return DriverManager.getConnection(jdbcurl, props);
    }

    @Override
    public String[][] queryDimVals(Map<String, String> dataSource, Map<String, String> query, String columnName, AggConfig config) throws Exception {
        String fsql = null;
        String exec = null;
        String sql = query.get(SQL);
        List<String> filtered = new ArrayList<>();
        List<String> nofilter = new ArrayList<>();
        if (config != null) {
            Stream<DimensionConfig> c = config.getColumns().stream();
            Stream<DimensionConfig> r = config.getRows().stream();
            Stream<DimensionConfig> f = config.getFilters().stream();
            Stream<DimensionConfig> filters = Stream.concat(Stream.concat(c, r), f);
            String where = "1=1 AND " + filters.map(toWhere).filter(e -> e != null).collect(Collectors.joining(" AND "));
            fsql = "select distinct  __view__.%s from (%s) __view__ where %s";
            exec = String.format(fsql, columnName, sql, where);
            LOG.info(exec);
            try (Connection connection = getConnection(dataSource);
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
        fsql = "select distinct  __view__.%s from (%s) __view__";
        exec = String.format(fsql, columnName, sql);
        LOG.info(exec);
        try (Connection connection = getConnection(dataSource);
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


    private Function<DimensionConfig, String> toWhere = (config) -> {
        if (config.getValues().size() == 0) {
            return null;
        }
        switch (config.getFilterType()) {
            case "=":
            case "eq":
                return "(" + config.getValues().stream().map(e -> config.getColumnName() + " = '" + e + "'").collect(Collectors.joining(" OR ")) + ")";
            case "≠":
            case "ne":
                return "(" + config.getValues().stream().map(e -> config.getColumnName() + " <> '" + e + "'").collect(Collectors.joining(" AND ")) + ")";
            case ">":
                return config.getColumnName() + " > '" + config.getValues().get(0) + "'";
            case "<":
                return config.getColumnName() + " < '" + config.getValues().get(0) + "'";
            case "≥":
                return config.getColumnName() + " >= '" + config.getValues().get(0) + "'";
            case "≤":
                return config.getColumnName() + " <= '" + config.getValues().get(0) + "'";
            case "(a,b]":
                if (config.getValues().size() >= 2) {
                    return "(" + config.getColumnName() + " > '" + config.getValues().get(0) + "' AND " + config.getColumnName() + " <= '" + config.getValues().get(0) + "')";
                } else {
                    return null;
                }
            case "[a,b)":
                if (config.getValues().size() >= 2) {
                    return "(" + config.getColumnName() + " >= '" + config.getValues().get(0) + "' AND " + config.getColumnName() + " < '" + config.getValues().get(0) + "')";
                } else {
                    return null;
                }
            case "(a,b)":
                if (config.getValues().size() >= 2) {
                    return "(" + config.getColumnName() + " > '" + config.getValues().get(0) + "' AND " + config.getColumnName() + " < '" + config.getValues().get(0) + "')";
                } else {
                    return null;
                }
            case "[a,b]":
                if (config.getValues().size() >= 2) {
                    return "(" + config.getColumnName() + " >= '" + config.getValues().get(0) + "' AND " + config.getColumnName() + " <= '" + config.getValues().get(0) + "')";
                } else {
                    return null;
                }
        }
        return null;
    };

    @Override
    public String[] getColumn(Map<String, String> dataSource, Map<String, String> query) throws Exception {
        try (Connection connection = getConnection(dataSource);
             PreparedStatement ps = connection.prepareStatement(query.get(SQL));
             ResultSet rs = ps.executeQuery()) {
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            String[] row = new String[columnCount];
            for (int i = 0; i < columnCount; i++) {
                row[i] = metaData.getColumnLabel(i + 1);
            }
            return row;
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }
    }

    @Override
    public AggregateResult queryAggData(Map<String, String> dataSource, Map<String, String> query, AggConfig config) throws Exception {
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<DimensionConfig> f = config.getFilters().stream();
        Stream<DimensionConfig> filters = Stream.concat(Stream.concat(c, r), f);
        StringJoiner where = new StringJoiner(" AND ", "WHERE ", "");
        where.setEmptyValue("");
        filters.map(toWhere).filter(e -> e != null).forEach(where::add);
        String select = config.getValues().stream().map(toSelect).collect(Collectors.joining(", "));
        Stream<DimensionConfig> group = Stream.concat(config.getColumns().stream(), config.getRows().stream());
        String groupby = group.map(g -> g.getColumnName()).distinct().collect(Collectors.joining(", "));
        select = String.join(",", groupby, select);
        groupby = StringUtils.isBlank(groupby) ? "" : "group by " + groupby;
        String sql = query.get(SQL);
        String fsql = "select %s from (%s) __view__ %s %s";
        String exec = String.format(fsql, select, sql, where, groupby);
        List<String[]> list = new LinkedList<>();
        LOG.info(exec);
        try (Connection connection = getConnection(dataSource);
             PreparedStatement ps = connection.prepareStatement(exec);
             ResultSet rs = ps.executeQuery()) {
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
        group = Stream.concat(config.getColumns().stream(), config.getRows().stream());
        List<ColumnIndex> dimensionList = group.map(ColumnIndex::fromDimensionConfig).collect(Collectors.toList());
        dimensionList.addAll(config.getValues().stream().map(ColumnIndex::fromValueConfig).collect(Collectors.toList()));
        IntStream.range(0, dimensionList.size()).forEach(j -> dimensionList.get(j).setIndex(j));
        String[][] result = list.toArray(new String[][]{});
        return new AggregateResult(dimensionList, result);
    }

    private Function<ValueConfig, String> toSelect = (config) -> {
        switch (config.getAggType()) {
            case "sum":
                return "SUM(__view__." + config.getColumn() + ") sum" + config.getColumn();
            case "avg":
                return "AVG(__view__." + config.getColumn() + ") avg" + config.getColumn();
            case "max":
                return "MAX(__view__." + config.getColumn() + ") max" + config.getColumn();
            case "min":
                return "MIN(__view__." + config.getColumn() + ") min" + config.getColumn();
            default:
                return "COUNT(__view__." + config.getColumn() + ") count" + config.getColumn();
        }
    };
}
