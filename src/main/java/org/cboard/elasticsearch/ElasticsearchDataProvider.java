package org.cboard.elasticsearch;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONPath;
import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import org.apache.commons.collections.keyvalue.DefaultMapEntry;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.fluent.Request;
import org.apache.http.entity.ContentType;
import org.apache.http.util.EntityUtils;
import org.cboard.cache.CacheManager;
import org.cboard.cache.HeapCacheManager;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.Initializing;
import org.cboard.dataprovider.aggregator.Aggregatable;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.config.DimensionConfig;
import org.cboard.dataprovider.config.ValueConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.result.ColumnIndex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * Created by yfyuan on 2017/3/17.
 */
@ProviderName(name = "Elasticsearch")
public class ElasticsearchDataProvider extends DataProvider implements Aggregatable, Initializing {

    private static final Logger LOG = LoggerFactory.getLogger(ElasticsearchDataProvider.class);

    @DatasourceParameter(label = "Elasticsearch Server (domain:port)", type = DatasourceParameter.Type.Input, order = 1)
    protected String SERVERIP = "serverIp";

    @QueryParameter(label = "Index", type = QueryParameter.Type.Input, order = 2)
    protected String INDEX = "index";

    @QueryParameter(label = "Type", type = QueryParameter.Type.Input, order = 3)
    protected String TYPE = "type";

    @QueryParameter(label = "Override Aggregations", type = QueryParameter.Type.TextArea, order = 6)
    private String OVERRIDE = "override";

    private JSONObject overrideAggregations = new JSONObject();

    private static final CacheManager<Map<String, String>> typesCache = new HeapCacheManager<>();

    private static final JSONPath jsonPath_value = JSONPath.compile("$..value");

    @Override
    public String[][] queryDimVals(String columnName, AggConfig config) throws Exception {
        JSONObject request = new JSONObject();
        request.put("size", 0);
        request.put("aggregations", getTermsAggregation(columnName));
        JSONObject response = post(getSearchUrl(), request);
        String[] nofilter = response.getJSONObject("aggregations").getJSONObject(columnName).getJSONArray("buckets").stream()
                .map(e -> ((JSONObject) e).getString("key")).toArray(String[]::new);
        if (config != null) {
            JSONArray filter = getFilter(config);
            if (filter.size() > 0) {
                request.put("query", new JSONObject());
                request.getJSONObject("query").put("bool", new JSONObject());
                request.getJSONObject("query").getJSONObject("bool").put("filter", getFilter(config));
                response = post(getSearchUrl(), request);
                String[] filtered = response.getJSONObject("aggregations").getJSONObject(columnName).getJSONArray("buckets").stream()
                        .map(e -> ((JSONObject) e).getString("key")).toArray(String[]::new);
                return new String[][]{filtered, nofilter};
            }
        }
        return new String[][]{nofilter, nofilter};
    }

    private JSONArray getFilter(AggConfig config) {
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<DimensionConfig> f = config.getFilters().stream();
        Stream<DimensionConfig> filters = Stream.concat(Stream.concat(c, r), f);
        JSONArray result = new JSONArray();
        filters.map(e -> getFilterPart(e)).filter(e -> e != null).forEach(result::add);
        return result;
    }

    private JSONObject getFilterPart(DimensionConfig config) {
        if (config.getValues().size() == 0) {
            return null;
        }
        switch (config.getFilterType()) {
            case "=":
            case "eq":
                return getFilterPartEq("should", config.getColumnName(), config.getValues());
            case "≠":
            case "ne":
                return getFilterPartEq("must_not", config.getColumnName(), config.getValues());
            case ">":
                return getFilterPartRange("gt", config.getColumnName(), config.getValues().get(0));
            case "<":
                return getFilterPartRange("lt", config.getColumnName(), config.getValues().get(0));
            case "≥":
                return getFilterPartRange("gte", config.getColumnName(), config.getValues().get(0));
            case "≤":
                return getFilterPartRange("lte", config.getColumnName(), config.getValues().get(0));
            case "(a,b]":
                if (config.getValues().size() < 2) {
                    return null;
                }
                return getFilterPartRangeRounding("gt", "lte", config.getColumnName(), config.getValues().get(0), config.getValues().get(1));
            case "[a,b)":
                if (config.getValues().size() < 2) {
                    return null;
                }
                return getFilterPartRangeRounding("gte", "lt", config.getColumnName(), config.getValues().get(0), config.getValues().get(1));
            case "(a,b)":
                if (config.getValues().size() < 2) {
                    return null;
                }
                return getFilterPartRangeRounding("gt", "lt", config.getColumnName(), config.getValues().get(0), config.getValues().get(1));
            case "[a,b]":
                if (config.getValues().size() < 2) {
                    return null;
                }
                return getFilterPartRangeRounding("gte", "lte", config.getColumnName(), config.getValues().get(0), config.getValues().get(1));
        }
        return null;
    }

    private JSONObject getFilterPartRangeRounding(String range, String range2, String terms, String value, String value2) {
        JSONObject result = new JSONObject();
        result.put("range", new JSONObject());
        result.getJSONObject("range").put(terms, new JSONObject());
        result.getJSONObject("range").getJSONObject(terms).put(range, value);
        result.getJSONObject("range").getJSONObject(terms).put(range2, value2);
        return result;
    }

    private JSONObject getFilterPartRange(String range, String terms, String value) {
        JSONObject result = new JSONObject();
        result.put("range", new JSONObject());
        result.getJSONObject("range").put(terms, new JSONObject());
        result.getJSONObject("range").getJSONObject(terms).put(range, value);
        return result;
    }

    private JSONObject getFilterPartEq(String bool, String terms, List<String> values) {
        JSONObject result = new JSONObject();
        result.put("bool", new JSONObject());
        result.getJSONObject("bool").put(bool, new JSONArray());
        JSONArray boolArr = result.getJSONObject("bool").getJSONArray(bool);
        values.stream().map(e -> {
            JSONObject term = new JSONObject();
            term.put("term", new JSONObject());
            term.getJSONObject("term").put(terms, e);
            return term;
        }).forEach(boolArr::add);
        return result;
    }

    protected JSONObject post(String url, JSONObject request) throws Exception {
        HttpResponse httpResponse = Request.Post(url).bodyString(request.toString(), ContentType.APPLICATION_JSON).execute().returnResponse();
        String response = EntityUtils.toString(httpResponse.getEntity());
        if (httpResponse.getStatusLine().getStatusCode() == 200) {
            return JSONObject.parseObject(response);
        } else {
            throw new Exception(response);
        }
    }

    protected JSONObject get(String url) throws Exception {
        String response = Request.Get(url).execute().returnContent().asString();
        return JSONObject.parseObject(response);
    }

    private JSONObject getOverrideTermsAggregation(String columnName) {
        if (overrideAggregations.containsKey(columnName)) {
            JSONObject override = new JSONObject();
            override.put(columnName, overrideAggregations.getJSONObject(columnName));
            return override;
        }
        return null;
    }

    protected JSONObject getTermsAggregation(String columnName) {
        JSONObject result = getOverrideTermsAggregation(columnName);
        if (result != null) {
            return result;
        } else {
            JSONObject aggregation = new JSONObject();
            aggregation.put(columnName, new JSONObject());
            aggregation.getJSONObject(columnName).put("terms", new JSONObject());
            aggregation.getJSONObject(columnName).getJSONObject("terms").put("field", columnName);
            aggregation.getJSONObject(columnName).getJSONObject("terms").put("size", 1000);
            return aggregation;
        }
    }

    protected String getMappingUrl() {
        return String.format("http://%s/%s/_mapping/%s", dataSource.get(SERVERIP), query.get(INDEX), query.get(TYPE));
    }

    protected String getSearchUrl() {
        return String.format("http://%s/%s/_search", dataSource.get(SERVERIP), query.get(INDEX));
    }

    @Override
    public String[] getColumn() throws Exception {
        Map<String, String> types = getTypes();
        return types.keySet().toArray(new String[0]);
    }

    private Map<String, String> getTypes() throws Exception {
        String key = getKey();
        Map<String, String> types = typesCache.get(key);
        if (types == null) {
            synchronized (key.intern()) {
                types = typesCache.get(key);
                if (types == null) {
                    JSONObject mapping = get(getMappingUrl());
                    mapping = mapping.getJSONObject(mapping.keySet().iterator().next()).getJSONObject("mappings").getJSONObject(query.get(TYPE));
                    types = new HashMap<>();
                    getField(types, new DefaultMapEntry(null, mapping), null);
                    typesCache.put(key, types, 1 * 60 * 60 * 1000);
                }
            }
        }
        return types;
    }

    @Override
    public AggregateResult queryAggData(AggConfig config) throws Exception {
        LOG.info("queryAggData");
        JSONObject request = getQueryAggDataRequest(config);
        JSONObject response = post(getSearchUrl(), request);
        Stream<DimensionConfig> dimStream = Stream.concat(config.getColumns().stream(), config.getRows().stream());
        List<ColumnIndex> dimensionList = dimStream.map(ColumnIndex::fromDimensionConfig).collect(Collectors.toList());
        List<ColumnIndex> valueList = config.getValues().stream().map(ColumnIndex::fromValueConfig).collect(Collectors.toList());
        List<ColumnIndex> columnList = new ArrayList<>();
        columnList.addAll(dimensionList);
        columnList.addAll(valueList);
        IntStream.range(0, columnList.size()).forEach(j -> columnList.get(j).setIndex(j));
        List<String[]> result = new ArrayList<>();
        JSONObject aggregations = response.getJSONObject("aggregations");
        getAggregationResponse(aggregations, result, null, 0, dimensionList, valueList);
        String[][] _result = result.toArray(new String[][]{});
        return new AggregateResult(columnList, _result);
    }

    private JSONObject getQueryAggDataRequest(AggConfig config) throws Exception {
        JSONObject request = new JSONObject();
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<DimensionConfig> aggregationStream = Stream.concat(c, r);
        List<JSONObject> termAggregations = aggregationStream.map(e -> getTermsAggregation(e.getColumnName())).collect(Collectors.toList());
        JSONObject metricAggregations = getMetricAggregation(config.getValues(), getTypes());
        termAggregations.add(metricAggregations);
        for (int i = termAggregations.size() - 1; i > 0; i--) {
            JSONObject pre = termAggregations.get(i - 1);
            String key = pre.keySet().iterator().next();
            pre.getJSONObject(key).put("aggregations", termAggregations.get(i));
        }
        request.put("size", 0);
        request.put("query", new JSONObject());
        request.getJSONObject("query").put("bool", new JSONObject());
        request.getJSONObject("query").getJSONObject("bool").put("filter", getFilter(config));
        request.put("aggregations", termAggregations.get(0));
        return request;
    }

    private void getAggregationResponse(JSONObject object, List<String[]> result, List<String> parentKeys, int dimensionLevel, List<ColumnIndex> dimensionList, List<ColumnIndex> valueList) {
        List<String> keys = new ArrayList<>();
        if (parentKeys != null) {
            keys.addAll(parentKeys);
        }
        if (dimensionLevel > 0) {
            keys.add(object.getOrDefault("key_as_string", object.getString("key")).toString());
        }
        if (dimensionLevel >= dimensionList.size()) {
            for (ColumnIndex value : valueList) {
                String valueKey = getAggregationName(value.getAggType(), value.getName());
                JSONObject valueObject = object.getJSONObject(valueKey);
                List<Object> values = (List<Object>) jsonPath_value.eval(valueObject);
                keys.add("" + values.get(0));
            }
            result.add(keys.toArray(new String[keys.size()]));
        } else {
            JSONArray buckets = object.getJSONObject(dimensionList.get(dimensionLevel).getName()).getJSONArray("buckets");
            for (Object _bucket : buckets) {
                int nextLevel = dimensionLevel + 1;
                getAggregationResponse((JSONObject) _bucket, result, keys, nextLevel, dimensionList, valueList);
            }
        }
    }

    private String getAggregationName(String aggregationType, String columnName) {
        return Hashing.crc32().newHasher().putString(aggregationType + columnName, Charsets.UTF_8).hash().toString();
    }

    private JSONObject getMetricAggregation(List<ValueConfig> configList, Map<String, String> typesCache) {
        JSONObject aggregation = new JSONObject();
        configList.stream().forEach(config -> {
            String aggregationName = getAggregationName(config.getAggType(), config.getColumn());
            String type;
            switch (config.getAggType()) {
                case "sum":
                    type = "sum";
                    break;
                case "avg":
                    type = "avg";
                    break;
                case "max":
                    type = "max";
                    break;
                case "min":
                    type = "min";
                    break;
                default:
                    type = "value_count";
                    break;
            }
            aggregation.put(aggregationName, new JSONObject());
            if (typesCache.containsKey(config.getColumn())) {
                aggregation.getJSONObject(aggregationName).put(type, new JSONObject());
                aggregation.getJSONObject(aggregationName).getJSONObject(type).put("field", config.getColumn());
            } else {
                JSONObject extend = JSONObject.parseObject(config.getColumn());
                String column = extend.getString("column");
                JSONObject filter = extend.getJSONObject("filter");
                JSONObject script = extend.getJSONObject("script");
                JSONObject _aggregations = aggregation.getJSONObject(aggregationName);
                if (filter != null) {
                    _aggregations.put("filter", filter);
                    _aggregations.put("aggregations", new JSONObject());
                    _aggregations.getJSONObject("aggregations").put("agg_value", new JSONObject());
                    _aggregations = _aggregations.getJSONObject("aggregations").getJSONObject("agg_value");
                }
                _aggregations.put(type, new JSONObject());
                _aggregations = _aggregations.getJSONObject(type);
                if (script != null) {
                    _aggregations.put("script", script);
                } else {
                    _aggregations.put("field", column);
                }
            }
        });
        return aggregation;
    }

    @Override
    public String[][] getData() throws Exception {
        return new String[0][];
    }

    private String getKey() {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    private void getField(Map<String, String> types, Map.Entry<String, Object> field, String parent) {
        JSONObject value = (JSONObject) field.getValue();
        if (value.keySet().contains("properties")) {
            for (Map.Entry e : value.getJSONObject("properties").entrySet()) {
                getField(types, e, field.getKey());
            }
        } else {
            if (parent == null) {
                types.put(field.getKey(), value.getString("type"));
            } else {
                types.put(parent + "." + field.getKey(), value.getString("type"));
            }
        }
    }

    @Override
    public String viewAggDataQuery(AggConfig ac) throws Exception {
        String format = "curl -XPOST '%s?pretty' -d '\n%s'";
        String dsl = JSON.toJSONString(getQueryAggDataRequest(ac), true);
        return String.format(format, getSearchUrl(), dsl);
    }


    @Override
    public void afterPropertiesSet() throws Exception {
        if (StringUtils.isNotBlank(query.get(OVERRIDE))) {
            overrideAggregations = JSONObject.parseObject(query.get(OVERRIDE));
        }
    }
}
