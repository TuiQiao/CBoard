package org.cboard.dataprovider.config;

import org.cboard.dto.ViewAggConfig;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by zyong on 2017/1/9.
 */
public class AggConfig {

    private List<DimensionConfig> rows;
    private List<DimensionConfig> columns;
    private List<ConfigComponent> filters;
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

    public List<ConfigComponent> getFilters() {
        return filters;
    }

    public void setFilters(List<ConfigComponent> filters) {
        this.filters = filters;
    }

    public List<ValueConfig> getValues() {
        return values;
    }

    public void setValues(List<ValueConfig> values) {
        this.values = values;
    }
}
