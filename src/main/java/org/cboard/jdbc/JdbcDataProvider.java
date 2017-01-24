package org.cboard.jdbc;

import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.exception.CBoardException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.sql.*;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * Created by yfyuan on 2016/8/17.
 */
@ProviderName(name = "jdbc")
public class JdbcDataProvider extends DataProvider {

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
                resultCount ++;
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

}
