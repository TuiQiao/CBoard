package org.cboard.dto;

import com.google.common.base.Function;
import org.cboard.pojo.DashboardFolder;

import javax.annotation.Nullable;
import java.sql.Timestamp;

/**
 * Created by jx_luo on 2017/10/13.
 */
public class ViewDashboardFolder {
    private int id;
    private String name;
    private int parentId;
    private int isPrivate;
    private String userId;
    private Timestamp createTime;
    private Timestamp updateTime;

    public static final Function TO = new Function<DashboardFolder, ViewDashboardFolder>() {
        @Nullable
        @Override
        public ViewDashboardFolder apply(@Nullable DashboardFolder input) {
            return new ViewDashboardFolder(input);
        }
    };

    public ViewDashboardFolder(DashboardFolder folder) {
        this.id = folder.getId();
        this.name = folder.getName();
        this.parentId = folder.getParentId();
        this.isPrivate = folder.getIsPrivate();
        this.userId = folder.getUserId();
        this.createTime = folder.getCreateTime();
        this.updateTime = folder.getUpdateTime();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getIsPrivate() {
        return isPrivate;
    }

    public void setIsPrivate(int isPrivate) {
        this.isPrivate = isPrivate;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getParentId() {
        return parentId;
    }

    public void setParentId(int parentId) {
        this.parentId = parentId;
    }

    public Timestamp getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Timestamp createTime) {
        this.createTime = createTime;
    }

    public Timestamp getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Timestamp updateTime) {
        this.updateTime = updateTime;
    }
}
