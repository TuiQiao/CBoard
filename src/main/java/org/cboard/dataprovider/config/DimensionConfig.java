package org.cboard.dataprovider.config;

import java.util.List;

/**
 * Created by yfyuan on 2017/1/17.
 */
public class DimensionConfig extends ConfigComponent {
    private String columnName;
    private String level;
    private String filterType;
    private List<String> values;
    private String custom;

    public String getColumnName() {
        return columnName;
    }

    public String getLevel() {
        return level;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    public void setLevel(String level) {
        this.level = level;
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
