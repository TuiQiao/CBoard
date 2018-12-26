package org.cboard.dataprovider.aggregator.h2;

import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.config.ValueConfig;
import org.cboard.dataprovider.util.SqlHelper;
import org.cboard.dataprovider.util.SqlSyntaxHelper;

/**
 * Created by zyong on 2017/9/18.
 */
public class H2SyntaxHelper extends SqlSyntaxHelper {

    @Override
    public String getProjectStr(DimensionConfig config) {
        return SqlHelper.surround(super.getProjectStr(config), "`");
    }

    @Override
    public String getColumnNameInFilter(DimensionConfig config) {
        /**
         * LPAD is a temporary workaround for number compare
         */
        return "LPAD(" + this.getProjectStr(config) + ", 20, '0')";
    }

    @Override
    public String getDimMemberStr(DimensionConfig config, int index) {
        return "LPAD(" + super.getDimMemberStr(config, index) + ", 20, '0')";
    }

    @Override
    public String getAggStr(ValueConfig vConfig) {
        String aggExp = SqlHelper.surround(vConfig.getColumn(), "`");
        switch (vConfig.getAggType()) {
            case "sum":
                return "SUM(f_todouble(" + aggExp + "))";
            case "avg":
                return "AVG(f_todouble(" + aggExp + "))";
            case "max":
                return "MAX(f_todouble(" + aggExp + "))";
            case "min":
                return "MIN(f_todouble(" + aggExp + "))";
            case "distinct":
                return "COUNT(DISTINCT " + aggExp + ")";
            default:
                return "COUNT(" + aggExp + ")";
        }
    }
}
