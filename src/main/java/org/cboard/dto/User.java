package org.cboard.dto;

/**
 * Created by yfyuan on 2016/9/29.
 */
public class User {

    private String userId;
    private String username;
    private String company;
    private String department;

    public User(String userId, String username) {
        this.userId = userId;
        this.username = username;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
