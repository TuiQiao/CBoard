package org.cboard.dataprovider.result;

import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.config.ValueConfig;

/**
 * Created by yfyuan on 2017/1/19.
 */
public class ColumnIndex {

    private int index;
    private String aggType;
    private String name;

    public static ColumnIndex fromDimensionConfig(final DimensionConfig dimensionConfig) {
        ColumnIndex columnIndex = new ColumnIndex();
        columnIndex.setName(dimensionConfig.getColumnName());
        return columnIndex;
    }

    public static ColumnIndex fromValueConfig(final ValueConfig valueConfig) {
        ColumnIndex columnIndex = new ColumnIndex();
        columnIndex.setName(valueConfig.getColumn());
        columnIndex.setAggType(valueConfig.getAggType());
        return columnIndex;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getAggType() {
        return aggType;
    }

    public void setAggType(String aggType) {
        this.aggType = aggType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
