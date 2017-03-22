package org.cboard.dataprovider.aggregator;

import java.util.Map;

/**
 * Created by zyong on 2017/1/9.
 */
public abstract class InnerAggregator implements Aggregatable {

    protected Map<String, String> dataSource;
    protected Map<String, String> query;

    public InnerAggregator() {}

    public abstract boolean checkExist();

    public abstract void loadData(String[][] data, long interval);

    public abstract void cleanExist();

    public void setDataSource(Map<String, String> dataSource) {
        this.dataSource = dataSource;
    }

    public void setQuery(Map<String, String> query) {
        this.query = query;
    }
}
