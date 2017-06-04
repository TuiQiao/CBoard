package org.cboard.pojo;

/**
 * Created by yfyuan on 2016/12/7.
 */
public class DashboardRoleRes {
    private Long roleResId;
    private String roleId;
    private Long resId;
    private String resType;
    private String permission;

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }

    public String getResType() {
        return resType;
    }

    public void setResType(String resType) {
        this.resType = resType;
    }

    public Long getRoleResId() {
        return roleResId;
    }

    public void setRoleResId(Long roleResId) {
        this.roleResId = roleResId;
    }

    public String getRoleId() {
        return roleId;
    }

    public void setRoleId(String roleId) {
        this.roleId = roleId;
    }

    public Long getResId() {
        return resId;
    }

    public void setResId(Long resId) {
        this.resId = resId;
    }
}
