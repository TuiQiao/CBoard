package org.cboard.dataprovider;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import org.cboard.dataprovider.aggregator.Aggregator;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

/**
 * Created by zyong on 2017/1/9.
 */
public abstract class DataProvider {

    @Autowired
    private Aggregator aggregator;
    private Map<String, String> dataSource;
    private Map<String, String> query;
    private int resultLimit;

    /**
     * get the aggregated data by user's widget designer
     *
     * @return
     */
    public AggregateResult getAggData(AggConfig ac, boolean reload) throws Exception {
        if (this instanceof AggregateProvider) {
            return ((AggregateProvider) this).queryAggData(dataSource, query, ac);
        } else {
            checkAndLoad(reload);
            return aggregator.queryAggData(dataSource, query, ac);
        }
    }

    /**
     * Get the options values of a dimension column
     *
     * @param columnName
     * @return
     */
    public String[][] getDimVals(String columnName, AggConfig config, boolean reload) throws Exception {
        String[][] dimVals = null;
        if (this instanceof AggregateProvider) {
            dimVals = ((AggregateProvider) this).queryDimVals(dataSource, query, columnName, config);
        } else {
            checkAndLoad(reload);
            dimVals = aggregator.queryDimVals(dataSource, query, columnName, config);
        }
        return dimVals;
    }

    public String[] getColumn(boolean reload) throws Exception {
        String[] columns = null;
        if (this instanceof AggregateProvider) {
            columns = ((AggregateProvider) this).getColumn(dataSource, query);
        } else {
            checkAndLoad(reload);
            columns = aggregator.getColumn(dataSource, query);
        }
        return columns;
    }

    private void checkAndLoad(boolean reload) throws Exception {
        String key = getLockKey(dataSource, query);
        synchronized (key){
            if (reload) {
                aggregator.cleanExist(dataSource, query);
            }
            if (!aggregator.checkExist(dataSource, query)) {
                String[][] data = getData(dataSource, query);
                aggregator.loadData(dataSource, query, data);
            }
        }
    }

    private String getLockKey(Map<String, String> dataSource, Map<String, String> query) {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    abstract public String[][] getData(Map<String, String> dataSource, Map<String, String> query) throws Exception;

    public void setDataSource(Map<String, String> dataSource) {
        this.dataSource = dataSource;
    }

    public void setQuery(Map<String, String> query) {
        this.query = query;
    }

    public void setResultLimit(int resultLimit) {
        this.resultLimit = resultLimit;
    }

    public int getResultLimit() {
        return resultLimit;
    }
}
