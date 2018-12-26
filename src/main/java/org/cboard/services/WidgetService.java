package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang3.StringUtils;
import org.cboard.dao.DatasetDao;
import org.cboard.dao.DatasourceDao;
import org.cboard.dao.WidgetDao;
import org.cboard.pojo.DashboardDataset;
import org.cboard.pojo.DashboardWidget;
import org.cboard.services.role.RolePermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by yfyuan on 2016/8/22.
 */
@Repository
public class WidgetService {

    @Autowired
    private WidgetDao widgetDao;

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private DatasourceDao datasourceDao;

    public ServiceStatus save(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardWidget widget = new DashboardWidget();
        widget.setUserId(userId);
        widget.setName(jsonObject.getString("name"));
        widget.setData(jsonObject.getString("data"));
        widget.setCategoryName(jsonObject.getString("categoryName"));
        if (StringUtils.isEmpty(widget.getCategoryName())) {
            widget.setCategoryName("默认分类");
        }
        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("widget_name", widget.getName());
        paramMap.put("user_id", widget.getUserId());
        paramMap.put("category_name", widget.getCategoryName());

        if (widgetDao.countExistWidgetName(paramMap) <= 0) {
            widgetDao.save(widget);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "Duplicated name");
        }
    }

    public ServiceStatus update(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardWidget widget = new DashboardWidget();
        widget.setUserId(userId);
        widget.setId(jsonObject.getLong("id"));
        widget.setName(jsonObject.getString("name"));
        widget.setCategoryName(jsonObject.getString("categoryName"));
        widget.setData(jsonObject.getString("data"));
        widget.setUpdateTime(new Timestamp(Calendar.getInstance().getTimeInMillis()));
        if (StringUtils.isEmpty(widget.getCategoryName())) {
            widget.setCategoryName("默认分类");
        }
        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("widget_name", widget.getName());
        paramMap.put("user_id", widget.getUserId());
        paramMap.put("widget_id", widget.getId());
        paramMap.put("category_name", widget.getCategoryName());
        if (widgetDao.countExistWidgetName(paramMap) <= 0) {
            widgetDao.update(widget);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "Duplicated name");
        }
    }

    public ServiceStatus delete(String userId, Long id) {
        widgetDao.delete(id, userId);
        return new ServiceStatus(ServiceStatus.Status.Success, "success");
    }

    public ServiceStatus checkRule(String userId, Long widgetId) {
        DashboardWidget widget = widgetDao.getWidget(widgetId);
        if (widget == null) {
            return null;
        }
        JSONObject object = (JSONObject) JSONObject.parse(widget.getData());
        Long datasetId = object.getLong("datasetId");
        if (datasetId != null) {
            if (datasetDao.checkDatasetRole(userId, datasetId, RolePermission.PATTERN_READ) == 1) {
                return new ServiceStatus(ServiceStatus.Status.Success, "success");
            } else {
                DashboardDataset ds = datasetDao.getDataset(datasetId);
                return new ServiceStatus(ServiceStatus.Status.Fail, ds.getCategoryName() + "/" + ds.getName());
            }
        } else {
            Long datasourceId = object.getLong("datasource");
            if (datasourceDao.checkDatasourceRole(userId, datasourceId, RolePermission.PATTERN_READ) == 1) {
                return new ServiceStatus(ServiceStatus.Status.Success, "success");
            } else {
                return new ServiceStatus(ServiceStatus.Status.Fail, datasourceDao.getDatasource(datasourceId).getName());
            }
        }
    }
}
