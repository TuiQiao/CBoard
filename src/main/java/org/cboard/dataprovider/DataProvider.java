package org.cboard.dataprovider;

import java.util.Map;

/**
 * Created by yfyuan on 2016/8/15.
 */
public abstract class DataProvider {

    abstract public String[][] getData(Map<String, String> dataSource, Map<String, String> query) throws Exception;
}
