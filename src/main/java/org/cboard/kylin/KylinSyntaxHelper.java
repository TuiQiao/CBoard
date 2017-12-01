package org.cboard.kylin;

import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.config.ValueConfig;
import org.cboard.dataprovider.util.SqlSyntaxHelper;
import org.cboard.kylin.model.KylinBaseModel;

import net.logstash.logback.encoder.org.apache.commons.lang.StringUtils;

/**
 * Created by zyong on 2017/9/18.
 */
public class KylinSyntaxHelper extends SqlSyntaxHelper {

    private KylinBaseModel kylinModel;

    public KylinSyntaxHelper(KylinBaseModel kylinModel) {
        this.kylinModel = kylinModel;
    }

    @Override
    public String getProjectStr(DimensionConfig config) {
        return kylinModel.getColumnWithAliasPrefix(config.getColumnName());
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
                return "SUM(" + kylinModel.getColumnWithAliasPrefix(vConfig.getColumn()) + ") AS sum_" + StringUtils.substringAfter(vConfig.getColumn(), ".");
            case "avg":
                return "AVG(" + kylinModel.getColumnWithAliasPrefix(vConfig.getColumn()) + ") AS avg_" + StringUtils.substringAfter(vConfig.getColumn(), ".");
            case "max":
                return "MAX(" + kylinModel.getColumnWithAliasPrefix(vConfig.getColumn()) + ") AS max_" + StringUtils.substringAfter(vConfig.getColumn(), ".");
            case "min":
                return "MIN(" + kylinModel.getColumnWithAliasPrefix(vConfig.getColumn()) + ") AS min_" + StringUtils.substringAfter(vConfig.getColumn(), ".");
            case "distinct":
                return "COUNT(DISTINCT " + kylinModel.getColumnWithAliasPrefix(vConfig.getColumn()) + ") AS count_d_" + StringUtils.substringAfter(vConfig.getColumn(), ".");
            default:
                return "COUNT(" + kylinModel.getColumnWithAliasPrefix(vConfig.getColumn()) + ") AS count_" + StringUtils.substringAfter(vConfig.getColumn(), ".");
        }
    }


}