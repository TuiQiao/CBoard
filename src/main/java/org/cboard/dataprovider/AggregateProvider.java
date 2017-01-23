package org.cboard.dataprovider;

import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.result.AggregateResult;

import java.util.Map;

/**
 * Created by yfyuan on 2017/1/13.
 */
public interface AggregateProvider {

    /**
     * The data provider that support DataSource side Aggregation must implement this method.
     *
     * @param columnName
     * @return
     */
    String[][] queryDimVals(Map<String, String> dataSource, Map<String, String> query, String columnName, AggConfig config) throws Exception;

    /**
     * The data provider that support DataSource side Aggregation must implement this method.
     *
     * @return
     */
    String[] getColumn(Map<String, String> dataSource, Map<String, String> query) throws Exception;

    /**
     * The data provider that support DataSource side Aggregation must implement this method.
     *
     * @param ac aggregate configuration
     * @return
     */
    AggregateResult queryAggData(Map<String, String> dataSource, Map<String, String> query, AggConfig ac) throws Exception;
}
