package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.lang3.StringUtils;
import org.cboard.dao.DatasetDao;
import org.cboard.pojo.DashboardDataset;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by yfyuan on 2016/10/11.
 */
@Repository
public class DatasetService {

    @Autowired
    private DatasetDao datasetDao;

    public DashboardDataset getDataset(long id) {
        return datasetDao.getDataset(id);
    }

    public List<DashboardDataset> getDatasetList(String userId) {
        return datasetDao.getDatasetList(userId);
    }

    public ServiceStatus save(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardDataset dataset = new DashboardDataset();
        dataset.setUserId(userId);
        dataset.setName(jsonObject.getString("name"));
        dataset.setData(jsonObject.getString("data"));
        dataset.setCategoryName(jsonObject.getString("categoryName"));
        dataset.setFolderId(jsonObject.getInteger("folderId"));
        if (StringUtils.isEmpty(dataset.getCategoryName())) {
            dataset.setCategoryName("默认分类");
        }
        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("dataset_name", dataset.getName());
        paramMap.put("user_id", dataset.getUserId());
        paramMap.put("folder_id", dataset.getFolderId());
        if (datasetDao.countExistDatasetName(paramMap) <= 0) {
            datasetDao.save(dataset);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "Duplicated name");
        }
    }

    public ServiceStatus update(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardDataset dataset = new DashboardDataset();
        dataset.setUserId(userId);
        dataset.setId(jsonObject.getLong("id"));
        dataset.setName(jsonObject.getString("name"));
        dataset.setCategoryName(jsonObject.getString("categoryName"));
        dataset.setFolderId(jsonObject.getInteger("folderId"));
        dataset.setData(jsonObject.getString("data"));
        dataset.setUpdateTime(new Timestamp(Calendar.getInstance().getTimeInMillis()));
        if (StringUtils.isEmpty(dataset.getCategoryName())) {
            dataset.setCategoryName("默认分类");
        }
        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("dataset_name", dataset.getName());
        paramMap.put("user_id", dataset.getUserId());
        paramMap.put("dataset_id", dataset.getId());
        paramMap.put("folder_id", dataset.getFolderId());
        if (datasetDao.countExistDatasetName(paramMap) <= 0) {
            datasetDao.update(dataset);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "Duplicated name");
        }
    }

    public ServiceStatus delete(String userId, Long id) {
        datasetDao.delete(id, userId);
        return new ServiceStatus(ServiceStatus.Status.Success, "success");
    }

    public List<DashboardDataset> getDatasetListByFolderIds(Integer[] folderIds){
        if (folderIds == null || folderIds.length == 0) {
            return null;
        }
        Map<String, Object> params = new HashedMap();
        params.put("folderIds", folderIds);
        return datasetDao.getDatasetListByFolderIds(params);
    }
}
