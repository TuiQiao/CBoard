package org.cboard.dataprovider.aggregator.jvm;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import org.cboard.cache.CacheManager;
import org.cboard.dataprovider.aggregator.InnerAggregator;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.result.ColumnIndex;
import org.cboard.util.NaturalOrderComparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

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
@Scope("prototype")
public class JvmAggregator extends InnerAggregator {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    @Qualifier("rawDataCache")
    private CacheManager<String[][]> rawDataCache;

    private String getCacheKey() {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    public boolean checkExist() {
        return rawDataCache.get(getCacheKey()) != null;
    }

    public void cleanExist() {
        rawDataCache.remove(getCacheKey());
    }

    public void loadData(String[][] data, long interval) {
        rawDataCache.put(getCacheKey(), data, interval * 1000);
    }

    public String[][] queryDimVals(String columnName, AggConfig config) throws Exception {
        String[][] data = rawDataCache.get(getCacheKey());
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
    public String[] getColumn() throws Exception {
        String[][] data = rawDataCache.get(getCacheKey());
        return data[0];
    }

    @Override
    public AggregateResult queryAggData(AggConfig config) throws Exception {
        String[][] data = rawDataCache.get(getCacheKey());
        Map<String, Integer> columnIndex = getColumnIndex(data);
        Filter rowFilter = new Filter(config, columnIndex);

        Stream<ColumnIndex> columns = config.getColumns().stream().map(ColumnIndex::fromDimensionConfig);
        Stream<ColumnIndex> rows = config.getRows().stream().map(ColumnIndex::fromDimensionConfig);
        List<ColumnIndex> valuesList = config.getValues().stream().map(ColumnIndex::fromValueConfig).collect(Collectors.toList());
        List<ColumnIndex> dimensionList = Stream.concat(columns, rows).collect(Collectors.toList());
        dimensionList.forEach(e -> e.setIndex(columnIndex.get(e.getName())));
        valuesList.forEach(e -> e.setIndex(columnIndex.get(e.getName())));

        Map<Dimensions, Double[]> grouped = Arrays.stream(data).skip(1).filter(rowFilter::filter)
                .collect(Collectors.groupingBy(row -> {
                    String[] ds = dimensionList.stream().map(d -> row[d.getIndex()]).toArray(String[]::new);
                    return new Dimensions(ds);
                }, AggregateCollector.getCollector(valuesList)));

        String[][] result = new String[grouped.keySet().size()][dimensionList.size() + valuesList.size()];
        int i = 0;
        for (Dimensions d : grouped.keySet()) {
            result[i++] = Stream.concat(Arrays.stream(d.dimensions), Arrays.stream(grouped.get(d)).map(e -> e.toString())).toArray(String[]::new);
        }
        dimensionList.addAll(valuesList);
        IntStream.range(0, dimensionList.size()).forEach(j -> dimensionList.get(j).setIndex(j));
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

