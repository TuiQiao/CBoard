package org.cboard.dataprovider.util;

import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.config.ValueConfig;

import java.sql.Types;

/**
 * Created by zyong on 2017/9/18.
 */
public class SqlSyntaxHelper {

    public String getColumnStr(DimensionConfig config) {
        return config.getColumnName();
    }

}
