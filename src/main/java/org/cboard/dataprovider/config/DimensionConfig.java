package org.cboard.dataprovider.config;

import java.util.List;

/**
 * Created by yfyuan on 2017/1/17.
 */
public class DimensionConfig {
    private String columnName;
    private String filterType;
    private List<String> values;

    public String getColumnName() {
        return columnName;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public String getFilterType() {
        return filterType;
    }

    public void setFilterType(String filterType) {
        this.filterType = filterType;
    }

    public List<String> getValues() {
        return values;
    }

    public void setValues(List<String> values) {
        this.values = values;
    }
}
