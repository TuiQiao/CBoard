package org.cboard.kylin;

import java.io.Serializable;
import java.util.HashMap;

/**
 * Created by zyong on 2017/5/26.
 */
public class TableMap extends HashMap<String, String> implements Serializable {

    @Override
    public String get(Object key) {
        return super.get(key.toString().replace("\"", ""));
    }
}