package org.cboard.dataprovider.aggregator;

import org.cboard.dataprovider.config.AggConfig;

/**
 * Created by zyong on 2017/1/9.
 */
public interface Aggregator {

    String[][] aggregate(String cubeKey, AggConfig ac);
}
