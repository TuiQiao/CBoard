package org.cboard.services.persist;

import com.alibaba.fastjson.JSONObject;

/**
 * Created by yfyuan on 2017/2/21.
 */
public class PersistContext {
    private Long dashboardId;
    private JSONObject data;

    public PersistContext(Long dashboardId) {
        this.dashboardId = dashboardId;
    }

    public Long getDashboardId() {
        return dashboardId;
    }

    public void setDashboardId(Long dashboardId) {
        this.dashboardId = dashboardId;
    }

    public JSONObject getData() {
        return data;
    }

    public void setData(JSONObject data) {
        this.data = data;
    }
}
