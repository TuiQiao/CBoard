package org.cboard.dataprovider.result;

import java.util.List;

/**
 * Created by yfyuan on 2017/1/18.
 */
public class AggregateResult {
    private List<ColumnIndex> columnList;
    private String[][] data;

    public AggregateResult(List<ColumnIndex> columnList, String[][] data) {
        this.columnList = columnList;
        this.data = data;
    }

    public AggregateResult() {
    }

    public List<ColumnIndex> getColumnList() {
        return columnList;
    }

    public void setColumnList(List<ColumnIndex> columnList) {
        this.columnList = columnList;
    }

    public String[][] getData() {
        return data;
    }

    public void setData(String[][] data) {
        this.data = data;
    }
}
