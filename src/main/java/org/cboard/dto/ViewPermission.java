package org.cboard.dto;

import org.apache.commons.lang.StringUtils;

/**
 * Created by yfyuan on 2017/3/14.
 */
public class ViewPermission {

    public static boolean isEdit(String permission) {
        return get(permission, 0);
    }

    public static boolean isDelete(String permission) {
        return get(permission, 1);
    }

    public static boolean get(String permission, int bit) {
        if (StringUtils.isEmpty(permission) || permission.length() - 1 < bit) {
            return false;
        } else {
            return permission.toCharArray()[bit] == '1';
        }
    }
}
