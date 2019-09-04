package org.cboard.dataprovider.util;

import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.config.ValueConfig;

import java.sql.Types;
import java.util.Map;

/**
 * Created by zyong on 2017/9/18.
 */
public class SqlSyntaxHelper {

    private Map<String, Integer> columnTypes;

    public String getProjectStr(DimensionConfig config) {
        return config.getColumnName();
    }

    public String getColumnNameInFilter(DimensionConfig config) {
        return this.getProjectStr(config);
    }

    public String getDimMemberStr(DimensionConfig config, int index) {
        String memberStr =  config.getValues().get(index).replaceAll("'", "\\\\'");
        switch (columnTypes.get(config.getColumnName().toUpperCase())) {
            case Types.VARCHAR:
            case Types.CHAR:
            case Types.NVARCHAR:
            case Types.NCHAR:
            case Types.CLOB:
            case Types.NCLOB:
            case Types.LONGVARCHAR:
            case Types.LONGNVARCHAR:
            case Types.DATE:
            case Types.TIMESTAMP:
            case Types.TIMESTAMP_WITH_TIMEZONE:
                return "'" + memberStr + "'";
            default:
                return memberStr;
        }
    }

    public String getAggStr(ValueConfig vConfig) {
        String aggExp = vConfig.getColumn();
        switch (vConfig.getAggType()) {
            case "sum":
                return "SUM(" + aggExp + ")";
            case "avg":
                return "AVG(" + aggExp + ")";
            case "max":
                return "MAX(" + aggExp + ")";
            case "min":
                return "MIN(" + aggExp + ")";
            case "distinct":
                return "COUNT(DISTINCT " + aggExp + ")";
            default:
                return "COUNT(" + aggExp + ")";
        }
    }

    public SqlSyntaxHelper setColumnTypes(Map<String, Integer> columnTypes) {
        this.columnTypes = columnTypes;
        return this;
    }


}
