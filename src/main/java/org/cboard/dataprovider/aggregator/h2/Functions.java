package org.cboard.dataprovider.aggregator.h2;

/**
 * Created by zyong on 2017/9/18.
 */
public class Functions {

    public static double parserString2Double(String str) {
        if (null == str) {
            return 0f;
        }
        try {
            return Double.parseDouble(str);
        } catch (Exception e) {
            return 0f;
        }
    }
}
