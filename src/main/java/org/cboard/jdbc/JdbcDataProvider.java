package org.cboard.jdbc;

import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;

import java.sql.*;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * Created by yfyuan on 2016/8/17.
 */
@ProviderName(name = "JDBC")
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
        String driver = dataSource.get(DRIVER);
        String jdbcurl = dataSource.get(JDBC_URL);
        String username = dataSource.get(USERNAME);
        String password = dataSource.get(PASSWORD);

        String sql = query.get(SQL);

        Class.forName(driver);
        Properties props = new Properties();
        props.setProperty("user", username);
        props.setProperty("password", password);
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<String[]> list = null;

        try {
            con = DriverManager.getConnection(jdbcurl, props);

            ps = con.prepareStatement(sql);

            rs = ps.executeQuery();

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            list = new LinkedList<>();
            String[] row = new String[columnCount];
            for (int i = 0; i < columnCount; i++) {
                row[i] = metaData.getColumnName(i + 1);
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
}
