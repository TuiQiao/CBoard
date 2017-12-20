package org.cboard.util;

import org.apache.commons.lang3.StringUtils;

/**
 * Created by yfyuan on 2017/3/23.
 */
public class SqlMethod {
    @SafeVarargs
    public static <T> T coalesce(T... p) {
        for (int i = 0; i < p.length; i++) {
            if (p[i] instanceof String && StringUtils.isEmpty((String) p[i])) {
                p[i] = null;
            }
            if (null != p[i]) {
                return p[i];
            }
        }
        return null;
    }
}
