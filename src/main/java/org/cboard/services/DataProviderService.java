package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Functions;
import com.google.common.collect.Maps;
import org.cboard.dao.DatasetDao;
import org.cboard.dao.DatasourceDao;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.DataProviderManager;
import org.cboard.dto.DataProviderResult;
import org.cboard.pojo.DashboardDataset;
import org.cboard.pojo.DashboardDatasource;
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

    @Autowired
    private DatasetDao datasetDao;

    public DataProviderResult getData(Long datasourceId, Map<String, String> query, Long datasetId) {
        if (datasetId != null) {
            Dataset dataset = getDataset(datasetId);
            datasourceId = dataset.getDatasourceId();
            query = dataset.getQuery();
        }
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

    protected Dataset getDataset(Long datasetId) {
        return new Dataset(datasetDao.getDataset(datasetId));
    }

    protected class Dataset {
        private Long datasourceId;
        private Map<String, String> query;

        public Dataset(DashboardDataset dataset) {
            JSONObject data = JSONObject.parseObject(dataset.getData());
            this.query = Maps.transformValues(data.getJSONObject("query"), Functions.toStringFunction());
            this.datasourceId = data.getLong("datasource");
        }

        public Long getDatasourceId() {
            return datasourceId;
        }

        public void setDatasourceId(Long datasourceId) {
            this.datasourceId = datasourceId;
        }

        public Map<String, String> getQuery() {
            return query;
        }

        public void setQuery(Map<String, String> query) {
            this.query = query;
        }
    }
}
