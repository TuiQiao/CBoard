package org.cboard.dataproviderexample;

import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.QueryParameter;

import java.util.Map;

/**
 * Created by zyong on 2016/9/27.
 */
// uncomment to active MyDataProvider example
//@ProviderName(name = "MyDataProvider")
public class MyDataProvider  extends DataProvider {

    // **数据源管理** 页面 创建数据源的时候需要配置的参数
    @DatasourceParameter(label = "数据源参数", type = DatasourceParameter.Type.Input, order = 1)
    private String DS_PARAM_KEY = "param";


    // **图表设计**页面 读取数据接收参数
    @QueryParameter(label = "查询参数", type = QueryParameter.Type.Input, order = 1)
    private String QUERY_PARAM_KEY = "query";

    @Override
    public boolean doAggregationInDataSource() {
        return false;
    }

    /**
     *
     * @return
     * @throws Exception
     */
    @Override
    public String[][] getData() throws Exception {
        // 获取data source 参数创建数据连接
        String param = dataSource.get(DS_PARAM_KEY);
        // TODO 利用接收到的DataSource配置参数创建DataSource连接，如：JDBC Connection，这个演示从内存返回数据，就不用创建连接了

        // 查询获取数据
        String queryParam = query.get(QUERY_PARAM_KEY);
        // 表头
        String[] header = {"D1", "D2", "D3", "M1", "M2"};
        String[] header2 = {"Dim1", "Dim2", "Dim3", "Measure1", "Measure2"};
        String[][] result = {
                "1".equals(queryParam) ? header : header2, // 第一行返回表头, 这里演示怎么和配置的查询前端参数交互切换表头
                {queryParam, "b1", "c1", "1", "2"},
                {queryParam, "b2", "c2", "13", "42"},
                {queryParam, "b1", "c3", "781", "52"},
                {queryParam, "b2", "c4", "17", "92"}
        };

        return result;
    }
}
