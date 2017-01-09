package org.cboard.dataprovider;

import org.cboard.cache.CacheManager;
import org.cboard.dataprovider.aggregator.Aggregator;
import org.cboard.dataprovider.config.AggConfig;

import java.util.Map;

/**
 * Created by zyong on 2017/1/9.
 */
public abstract class AdvanvedDataProvider {

    private Aggregator aggregator;
    private CacheManager cacheMgr;
    private boolean isSupportDataSourceAgg = false;
    private Map<String, String> dataSource;
    private Map<String, String> query;

    public AdvanvedDataProvider(
            Map<String, String> dataSource, Map<String, String> query,
            Aggregator aggregator, CacheManager cache,
            boolean isSupportDataSourceAgg
    ) {
        this.aggregator = aggregator;
        this.cacheMgr = cache;
        this.dataSource = dataSource;
        this.query = query;
    }

    /**
     * get the aggregated data by user's widget designer
     * @return
     */
    public String[][] getAggData(AggConfig ac) {
        String[][] aggData = null;
        if (isSupportDataSourceAgg) {
            aggData = this.queryAggData(ac);
        } else {
            aggData = aggregator.aggregate("key", ac);
        }
        return aggData;
    }

    /**
     * Load detail data into cache
     */
    public String[] loadData() {
        String [] columns = null;

        if (isSupportDataSourceAgg) {
            columns = getColumn();
        } else {
            String[][] dataWithColumns = getData();
            cacheMgr.put("DataSet_Key", dataWithColumns, 60 * 60 * 12 * 1000);
            columns = dataWithColumns[0];
        }
        return columns;
    }

    /**
     * Get the options values of a dimension column
     * @param columnName
     * @return
     */
    public String[] getDimVals(String columnName) {
        String [] dimVals = null;
        if (isSupportDataSourceAgg) {
            dimVals = queryDimVals(columnName);
        } else {
            // Streamly read data from cache and put the value in a Set
            cacheMgr.put("DataSet_column_key", dimVals, 60 * 60 * 12 * 1000);
        }
        return dimVals;
    }

    abstract public String[][] getData();

    /**
     * The data provider that support DataSource side Aggregation must implement this method.
     *
     * @param columnName
     * @return
     */
    abstract public String[] queryDimVals(String columnName);

    /**
     * The data provider that support DataSource side Aggregation must implement this method.
     *
     * @return
     */
    abstract public String[] getColumn();

    /**
     * The data provider that support DataSource side Aggregation must implement this method.
     * @param ac  aggregate configuration
     * @return
     */
    abstract public String[][] queryAggData(AggConfig ac);
}
