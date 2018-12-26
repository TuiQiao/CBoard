package org.cboard.dataprovider.config;

import java.util.List;

/**
 * Created by yfyuan on 2017/1/17.
 */
public class DimensionConfig extends ConfigComponent {
    private String columnName;
    private String filterType;
    private List<String> values;
    private String id;
    private String custom;

    public String getColumnName() {
        return columnName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
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
