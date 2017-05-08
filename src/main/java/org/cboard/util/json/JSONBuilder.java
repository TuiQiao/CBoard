package org.cboard.util.json;

import com.alibaba.fastjson.JSONObject;

/**
 * Created by Peter on 2017/5/6.
 */
public class JSONBuilder extends JSONObject {

    public static JSONBuilder json() {
        return new JSONBuilder();
    }
    public static JSONBuilder json(JSONObject jo) {
        return new JSONBuilder(jo);
    }

    public static JSONBuilder json(String key, Object value) {
        return new JSONBuilder().put(key, value);
    }

    public JSONBuilder() {}

    public JSONBuilder(JSONObject jo) {
        super(jo);
    }

    @Override
    public JSONBuilder put(String key, Object value) {
        super.put(key, value);
        return this;
    }


    public JSONBuilder putJSONObject(JSONObject jsonObject) {
        super.putAll(jsonObject);
        return this;
    }

    @Override
    public JSONBuilder getJSONObject(String key) {
        return new JSONBuilder(super.getJSONObject(key));
    }

    public String toString(boolean prettyFormat, int spaces) {
        String result = JSONObject.toJSONString(this, prettyFormat);
        StringBuffer space = new StringBuffer();
        if (prettyFormat) {
            for (int i = 0; i < spaces; i++) {
                space.append(" ");
            }
            return result.replaceAll("\\t", space.toString());
        }
        return result;
    }

    public String toString(boolean prettyFormat) {
        return toString(prettyFormat, 0);
    }

    @Override
    public String toString() {
        return toString(true, 2);
    }
}
