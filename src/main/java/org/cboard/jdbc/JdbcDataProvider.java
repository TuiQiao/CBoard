package org.cboard.jdbc;

import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.dataprovider.config.AggConfig;

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

        Connection con = getConnection(dataSource);

        String sql = query.get(SQL);
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<String[]> list = null;

        try {
            ps = con.prepareStatement(sql);
            rs = ps.executeQuery();
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
        } finally {
            if (rs != null) {
                try {
                    rs.close();
                } catch (Exception e) {
                }
            }
            if (ps != null) {
                try {
                    ps.close();
                } catch (Exception e) {
                }
            }
            if (con != null) {
                try {
                    con.close();
                } catch (Exception e) {
                }
            }
        }

        return list.toArray(new String[][]{});
    }

    @Override
    public int resultCount(Map<String, String> dataSource, Map<String, String> query) throws Exception {
        Connection con = getConnection(dataSource);
        StringBuffer cubeSqlBuffer = new StringBuffer();
        String querySql = query.get(SQL).replace(";", "");
        String driver = dataSource.get(DRIVER);
        boolean isOracle = driver.toLowerCase().indexOf("oracle") >= 0;
        cubeSqlBuffer.append("SELECT count(*) AS cnt FROM ( ")
                .append(querySql)
                .append(" ) ")
                .append(isOracle ? "" : " AS ")
                .append("cube_query__");

        PreparedStatement ps = null;
        ResultSet rs = null;
        int count = 0;

        try {
            ps = con.prepareStatement(cubeSqlBuffer.toString());
            rs = ps.executeQuery();
            rs.next();
            count = rs.getInt("cnt");
        } finally {
            if (rs != null) {
                try {
                    rs.close();
                } catch (Exception e) {
                }
            }
            if (ps != null) {
                try {
                    ps.close();
                } catch (Exception e) {
                }
            }
            if (con != null) {
                try {
                    con.close();
                } catch (Exception e) {
                }
            }
        }
        return count;
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
