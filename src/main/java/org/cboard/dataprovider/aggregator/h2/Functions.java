package org.cboard.dataprovider.aggregator.h2;

/**
 * Created by zyong on 2017/9/18.
 */
public class Functions {

    public static float parserString2Float(String str) {
        if (null == str) {
            return 0f;
        }
        try {
            return Float.parseFloat(str);
        } catch (Exception e) {
            return 0f;
        }
    }
}
