package org.cboard.kylin;

import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.config.ValueConfig;
import org.cboard.dataprovider.util.SqlSyntaxHelper;

/**
 * Created by zyong on 2017/9/18.
 */
public class KylinSyntaxHelper extends SqlSyntaxHelper {

    private KylinModel kylinModel;

    public KylinSyntaxHelper(KylinModel kylinModel) {
        this.kylinModel = kylinModel;
    }

    @Override
    public String getProjectStr(DimensionConfig config) {
        return kylinModel.getColumnAndAlias(config.getColumnName());
    }

    @Override
    public String getDimMemberStr(DimensionConfig config, int index) {
        if (kylinModel.getColumnType(config.getColumnName()).startsWith("varchar")) {
            return "'" + config.getValues().get(index) + "'";
        } else {
            return config.getValues().get(index);
        }
    }

    @Override
    public String getAggStr(ValueConfig vConfig) {
        switch (vConfig.getAggType()) {
            case "sum":
                return "SUM(" + kylinModel.getColumnAndAlias(vConfig.getColumn()) + ") AS sum_" + vConfig.getColumn();
            case "avg":
                return "AVG(" + kylinModel.getColumnAndAlias(vConfig.getColumn()) + ") AS avg_" + vConfig.getColumn();
            case "max":
                return "MAX(" + kylinModel.getColumnAndAlias(vConfig.getColumn()) + ") AS max_" + vConfig.getColumn();
            case "min":
                return "MIN(" + kylinModel.getColumnAndAlias(vConfig.getColumn()) + ") AS min_" + vConfig.getColumn();
            case "distinct":
                return "COUNT(DISTINCT " + kylinModel.getColumnAndAlias(vConfig.getColumn()) + ") AS count_d_" + vConfig.getColumn();
            default:
                return "COUNT(" + kylinModel.getColumnAndAlias(vConfig.getColumn()) + ") AS count_" + vConfig.getColumn();
        }
    }


}
