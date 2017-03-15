package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.cboard.dao.DatasourceDao;
import org.cboard.pojo.DashboardDatasource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by yfyuan on 2016/8/19.
 */
@Repository
public class DatasourceService {

    @Autowired
    private DatasourceDao datasourceDao;

    public ServiceStatus save(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardDatasource datasource = new DashboardDatasource();
        datasource.setUserId(userId);
        datasource.setName(jsonObject.getString("name"));
        datasource.setType(jsonObject.getString("type"));
        datasource.setConfig(jsonObject.getString("config"));

        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("user_id", datasource.getUserId());
        paramMap.put("source_name", datasource.getName());
        if (datasourceDao.countExistDatasourceName(paramMap) <= 0) {
            datasourceDao.save(datasource);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "名称已存在");
        }
    }

    public ServiceStatus update(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardDatasource datasource = new DashboardDatasource();
        datasource.setUserId(userId);
        datasource.setName(jsonObject.getString("name"));
        datasource.setType(jsonObject.getString("type"));
        datasource.setConfig(jsonObject.getString("config"));
        datasource.setId(jsonObject.getLong("id"));

        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("datasource_id", datasource.getId());
        paramMap.put("user_id", datasource.getUserId());
        paramMap.put("source_name", datasource.getName());
        if (datasourceDao.countExistDatasourceName(paramMap) <= 0) {
            datasourceDao.update(datasource);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "名称已存在");
        }
    }

    public ServiceStatus delete(String userId, Long id) {
        datasourceDao.delete(id, userId);
        return new ServiceStatus(ServiceStatus.Status.Success, "success");
    }

    public ServiceStatus checkDatasource(String userId, Long id) {
        DashboardDatasource datasource = datasourceDao.getDatasource(id);
        if (datasourceDao.checkDatasourceRole(userId, id,"%") == 1) {
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, datasource.getName());
        }
    }
}
