package org.cboard.dto;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Function;
import org.cboard.pojo.DashboardDataset;
import org.cboard.services.role.RolePermission;

import javax.annotation.Nullable;
import java.util.Map;

/**
 * Created by yfyuan on 2016/10/11.
 */
public class ViewDashboardDataset {
    private Long id;
    private String userId;
    private String name;
    private String categoryName;
    private Map<String, Object> data;
    private boolean edit;
    private boolean delete;


    public static final Function TO = new Function<DashboardDataset, ViewDashboardDataset>() {
        @Nullable
        @Override
        public ViewDashboardDataset apply(@Nullable DashboardDataset input) {
            return new ViewDashboardDataset(input);
        }
    };

    public ViewDashboardDataset(DashboardDataset dataset) {
        this.id = dataset.getId();
        this.userId = dataset.getUserId();
        this.name = dataset.getName();
        this.categoryName = dataset.getCategoryName();
        this.data = JSONObject.parseObject(dataset.getData());
        this.edit = RolePermission.isEdit(dataset.getPermission());
        this.delete = RolePermission.isDelete(dataset.getPermission());
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

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}
