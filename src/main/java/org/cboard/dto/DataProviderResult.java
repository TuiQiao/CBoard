package org.cboard.dto;

import java.io.Serializable;

/**
 * Created by yfyuan on 2016/8/26.
 */
public class DataProviderResult implements Serializable{

    private String[][] data;

    private String msg;

    public DataProviderResult(String[][] data, String msg) {
        this.data = data;
        this.msg = msg;
    }

    public String[][] getData() {
        return data;
    }

    public void setData(String[][] data) {
        this.data = data;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}
