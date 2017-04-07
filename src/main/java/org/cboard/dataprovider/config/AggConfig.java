package org.cboard.dataprovider.config;

import java.util.List;

/**
 * Created by zyong on 2017/1/9.
 */
public class AggConfig {

    private List<DimensionConfig> rows;
    private List<DimensionConfig> columns;
    private List<DimensionConfig> filters;
    private List<ValueConfig> values;

    public List<DimensionConfig> getRows() {
        return rows;
    }

    public void setRows(List<DimensionConfig> rows) {
        this.rows = rows;
    }

    public List<DimensionConfig> getColumns() {
        return columns;
    }

    public void setColumns(List<DimensionConfig> columns) {
        this.columns = columns;
    }

    public List<DimensionConfig> getFilters() {
        return filters;
    }

    public void setFilters(List<DimensionConfig> filters) {
        this.filters = filters;
    }

    public List<ValueConfig> getValues() {
        return values;
    }

    public void setValues(List<ValueConfig> values) {
        this.values = values;
    }
}
