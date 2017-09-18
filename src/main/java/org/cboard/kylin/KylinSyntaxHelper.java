package org.cboard.kylin;

import org.cboard.dataprovider.config.DimensionConfig;
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
    public String getColumnStr(DimensionConfig config) {
        return kylinModel.getColumnAndAlias(config.getColumnName());
    }
}
