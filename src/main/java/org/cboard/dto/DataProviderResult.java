package org.cboard.dto;

/**
 * Created by yfyuan on 2016/8/26.
 */
public class DataProviderResult {

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
