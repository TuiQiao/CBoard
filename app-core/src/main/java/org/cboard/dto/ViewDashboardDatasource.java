package org.cboard.dto;

import com.alibaba.fastjson.JSONObject;
import org.cboard.pojo.DashboardDatasource;
import com.google.common.base.Function;
import org.cboard.services.role.RolePermission;

import javax.annotation.Nullable;
import java.util.Map;

/**
 * Created by yfyuan on 2016/8/19.
 */
public class ViewDashboardDatasource {

    private Long id;
    private String userId;
    private String name;
    private String type;
    private Map<String, Object> config;
    private boolean edit;
    private boolean delete;
    private String userName;
    private String loginName;
    private String createTime;
    private String updateTime;

    public static final Function TO = new Function<DashboardDatasource, ViewDashboardDatasource>() {
        @Nullable
        @Override
        public ViewDashboardDatasource apply(@Nullable DashboardDatasource input) {
            return new ViewDashboardDatasource(input);
        }
    };

    public ViewDashboardDatasource(DashboardDatasource datasource) {
        this.id = datasource.getId();
        this.userId = datasource.getUserId();
        this.name = datasource.getName();
        this.type = datasource.getType();
        this.config = JSONObject.parseObject(datasource.getConfig());
        this.edit = RolePermission.isEdit(datasource.getPermission());
        this.delete = RolePermission.isDelete(datasource.getPermission());
        this.userName = datasource.getUserName();
        this.loginName = datasource.getLoginName();
        this.createTime = datasource.getCreateTime().toString();
        this.updateTime = datasource.getUpdateTime().toString();
    }

    public boolean isEdit() {
        return edit;
    }

    public void setEdit(boolean edit) {
        this.edit = edit;
    }

    public boolean isDelete() {
        return delete;
    }

    public void setDelete(boolean delete) {
        this.delete = delete;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getConfig() {
        return config;
    }

    public void setConfig(Map<String, Object> config) {
        this.config = config;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getLoginName() {
        return loginName;
    }

    public void setLoginName(String loginName) {
        this.loginName = loginName;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }
}
