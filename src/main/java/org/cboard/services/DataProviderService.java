package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.cboard.dao.DatasourceDao;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.DataProviderManager;
import org.cboard.dto.DataProviderResult;
import org.cboard.pojo.DashboardDatasource;
import com.google.common.base.Functions;
import com.google.common.collect.Maps;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Map;

/**
 * Created by yfyuan on 2016/8/15.
 */
@Repository
public class DataProviderService {

    @Autowired
    private DatasourceDao datasourceDao;

    public DataProviderResult getData(Long datasourceId, Map<String, String> query) {

        DashboardDatasource datasource = datasourceDao.getDatasource(datasourceId);
        try {
            JSONObject config = JSONObject.parseObject(datasource.getConfig());
            DataProvider dataProvider = DataProviderManager.getDataProvider(datasource.getType());
            String[][] data = dataProvider.getData(Maps.transformValues(config, Functions.toStringFunction()), query);
            return new DataProviderResult(data, "1");
        } catch (Exception e) {
            return new DataProviderResult(null, e.getMessage());
        }
    }
}
