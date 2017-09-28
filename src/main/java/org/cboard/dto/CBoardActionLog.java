package org.cboard.dto;

import com.alibaba.fastjson.JSON;

import java.util.Date;

/**
 * Created by zyong on 2017/9/28.
 */
public class CBoardActionLog {

    private User user;
    private String requestUrl;
    private Date actionTime = new Date();

    public CBoardActionLog() {}

    public CBoardActionLog(User user, String requestUrl) {
        this.user = user;
        this.requestUrl = requestUrl;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRequestUrl() {
        return requestUrl;
    }

    public void setRequestUrl(String requestUrl) {
        this.requestUrl = requestUrl;
    }

    public Date getActionTime() {
        return actionTime;
    }

    public void setActionTime(Date actionTime) {
        this.actionTime = actionTime;
    }

    @Override
    public String toString() {
        return JSON.toJSONStringWithDateFormat(this, "yyyy-MM-dd HH:mm:ss.SSS");
    }
}
