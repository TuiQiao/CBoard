package org.cboard.dataprovider.aggregator.jvm;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.collect.Ordering;
import com.google.common.hash.Hashing;
import org.cboard.cache.CacheManager;
import org.cboard.dataprovider.aggregator.Aggregator;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.result.ColumnIndex;
import org.cboard.util.NaturalOrderComparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * Created by yfyuan on 2017/1/18.
 */
@Service
public class JvmAggregator implements Aggregator {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    @Qualifier("rawDataCache")
    private CacheManager<String[][]> rawDataCache;

    private String getCacheKey(Map<String, String> dataSource, Map<String, String> query) {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    @Override
    public boolean checkExist(Map<String, String> dataSource, Map<String, String> query) {
        return rawDataCache.get(getCacheKey(dataSource, query)) != null;
    }

    @Override
    public void cleanExist(Map<String, String> dataSource, Map<String, String> query) {
        rawDataCache.remove(getCacheKey(dataSource, query));
    }

    @Override
    public void loadData(Map<String, String> dataSource, Map<String, String> query, String[][] data) {
        rawDataCache.put(getCacheKey(dataSource, query), data, 12 * 60 * 60 * 1000);
    }

    @Override
    public String[][] queryDimVals(Map<String, String> dataSource, Map<String, String> query, String columnName, AggConfig config) throws Exception {
        String[][] data = rawDataCache.get(getCacheKey(dataSource, query));
        Map<String, Integer> columnIndex = getColumnIndex(data);
        final int fi = columnIndex.get(columnName);
        Filter rowFilter = new Filter(config, columnIndex);
        NaturalOrderComparator comparator = new NaturalOrderComparator();
        String[] filtered = Arrays.stream(data).parallel().skip(1)
                .filter(rowFilter::filter)
                .map(e -> e[fi])
                .distinct()
                .sorted(comparator)
                .toArray(String[]::new);
        String[] nofilter = Arrays.stream(data).parallel().skip(1)
                .map(e -> e[fi])
                .distinct()
                .sorted()
                .toArray(String[]::new);
        return new String[][]{filtered, nofilter};
    }

    private Map<String, Integer> getColumnIndex(String[][] data) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < data[0].length; i++) {
            map.put(data[0][i], i);
        }
        return map;
    }

    @Override
    public String[] getColumn(Map<String, String> dataSource, Map<String, String> query) throws Exception {
        String[][] data = rawDataCache.get(getCacheKey(dataSource, query));
        return data[0];
    }

    @Override
    public AggregateResult queryAggData(Map<String, String> dataSource, Map<String, String> query, AggConfig config) throws Exception {
        StopWatch sw = new StopWatch();
        sw.start("get from cache");
        String[][] data = rawDataCache.get(getCacheKey(dataSource, query));
        sw.stop();
        Map<String, Integer> columnIndex = getColumnIndex(data);
        Filter rowFilter = new Filter(config, columnIndex);

        Stream<ColumnIndex> columns = config.getColumns().stream().map(ColumnIndex::fromDimensionConfig);
        Stream<ColumnIndex> rows = config.getRows().stream().map(ColumnIndex::fromDimensionConfig);
        List<ColumnIndex> valuesList = config.getValues().stream().map(ColumnIndex::fromValueConfig).collect(Collectors.toList());
        List<ColumnIndex> dimensionList = Stream.concat(columns, rows).collect(Collectors.toList());
        dimensionList.forEach(e -> e.setIndex(columnIndex.get(e.getName())));
        valuesList.forEach(e -> e.setIndex(columnIndex.get(e.getName())));

        sw.start("agg");
        Map<Dimensions, Double[]> grouped = Arrays.stream(data).parallel().skip(1).filter(rowFilter::filter)
                .collect(Collectors.groupingBy(row -> {
                    String[] ds = dimensionList.stream().map(d -> row[d.getIndex()]).toArray(String[]::new);
                    return new Dimensions(ds);
                }, AggregateCollector.getCollector(valuesList)));

        sw.stop();
        String[][] result = new String[grouped.keySet().size()][dimensionList.size() + valuesList.size()];
        int i = 0;
        for (Dimensions d : grouped.keySet()) {
            result[i++] = Stream.concat(Arrays.stream(d.dimensions), Arrays.stream(grouped.get(d)).map(e -> e.toString())).toArray(String[]::new);
        }
        dimensionList.addAll(valuesList);
        IntStream.range(0, dimensionList.size()).forEach(j -> dimensionList.get(j).setIndex(j));
        System.out.println(sw.prettyPrint());
        return new AggregateResult(dimensionList, result);
    }

    private class Dimensions {
        private String[] dimensions;

        public Dimensions(String[] dimensions) {
            this.dimensions = dimensions;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            Dimensions that = (Dimensions) o;

            // Probably incorrect - comparing Object[] arrays with Arrays.equals
            return Arrays.equals(dimensions, that.dimensions);
        }

        @Override
        public int hashCode() {
            return Arrays.hashCode(dimensions);
        }
    }
}

