package org.cboard.dataprovider.aggregator;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import org.cboard.cache.CacheManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.Map;

/**
 * Created by zyong on 2017/1/9.
 */
public abstract class InnerAggregator implements Aggregatable {

    protected Map<String, String> dataSource;
    protected Map<String, String> query;

//    @Autowired
//    @Qualifier("rawDataCache")
    protected CacheManager<String[][]> rawDataCache;

    public InnerAggregator() {}

    public abstract void loadData(String[][] data, long interval);

    public void setDataSource(Map<String, String> dataSource) {
        this.dataSource = dataSource;
    }

    public void setQuery(Map<String, String> query) {
        this.query = query;
    }

    protected String getCacheKey() {
        return Hashing.md5().newHasher().putString(
                JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(),
                Charsets.UTF_8).hash().toString();
    }

    public boolean checkExist() {
        return rawDataCache.get(getCacheKey()) != null;
    }

    public void cleanExist() {
        rawDataCache.remove(getCacheKey());
    }

    public void beforeLoad(String[] header) {}
    public void loadBatch(String[] header, String[][] data) {}
    public void afterLoad(){}
}
