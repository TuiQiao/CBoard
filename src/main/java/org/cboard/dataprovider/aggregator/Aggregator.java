package org.cboard.dataprovider.aggregator;

import org.cboard.dataprovider.AggregateProvider;

import java.util.Map;

/**
 * Created by zyong on 2017/1/9.
 */
public interface Aggregator extends AggregateProvider {

    boolean checkExist(Map<String, String> dataSource, Map<String, String> query);

    void loadData(Map<String, String> dataSource, Map<String, String> query, String[][] data, long interval);

    void cleanExist(Map<String, String> dataSource, Map<String, String> query);
}
