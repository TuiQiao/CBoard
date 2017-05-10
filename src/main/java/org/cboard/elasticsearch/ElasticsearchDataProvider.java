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
import org.cboard.dataprovider.config.*;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dataprovider.result.ColumnIndex;
import org.cboard.elasticsearch.query.QueryBuilder;
import org.cboard.util.SqlMethod;
import org.cboard.util.json.JSONBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.cboard.elasticsearch.query.QueryBuilder.*;
import static org.cboard.elasticsearch.aggregation.AggregationBuilder.*;
import static org.cboard.util.SqlMethod.*;
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
    public boolean doAggregationInDataSource() {
        return true;
    }

    @Override
    public String[] queryDimVals(String columnName, AggConfig config) throws Exception {
        JSONObject request = new JSONObject();
        request.put("size", 1000);
        request.put("aggregations", getAggregation(columnName, config));

        if (config != null) {
            JSONArray filter = getFilter(config);
            if (filter.size() > 0) {
                request.put("query", buildFilterDSL(config));
            }
        }
        JSONObject response = post(getSearchUrl(request), request);
        String[] filtered = response.getJSONObject("aggregations").getJSONObject(columnName).getJSONArray("buckets").stream()
                .map(e -> ((JSONObject) e).getString("key")).toArray(String[]::new);
        return filtered;
    }

    private JSONArray getFilter(AggConfig config) {
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<ConfigComponent> f = config.getFilters().stream();
        Stream<ConfigComponent> filters = Stream.concat(Stream.concat(c, r), f);
        JSONArray result = new JSONArray();
        filters.map(e -> configComponentToFilter(e)).filter(e -> e != null).forEach(result::add);
        return result;
    }

    private JSONObject configComponentToFilter(ConfigComponent cc) {
        if (cc instanceof DimensionConfig) {
            return getFilterPart((DimensionConfig) cc);
        } else if (cc instanceof CompositeConfig) {
            CompositeConfig compositeConfig = (CompositeConfig) cc;
            BoolType boolType = BoolType.MUST;
            if ("AND".equalsIgnoreCase(compositeConfig.getType())) {
                boolType = BoolType.MUST;
            } else if ("OR".equalsIgnoreCase(compositeConfig.getType())) {
                boolType = BoolType.SHOULD;
            }
            JSONArray boolArr = new JSONArray();
            compositeConfig.getConfigComponents().stream().map(e -> configComponentToFilter(e)).forEach(boolArr::add);
            return boolFilter(boolType, boolArr);
        }
        return null;
    }

    private JSONObject getFilterPart(DimensionConfig config) {
        if (config.getValues().size() == 0) {
            return null;
        }
        String fieldName = config.getColumnName();
        String v0 = config.getValues().get(0);
        String v1 = null;
        if (config.getValues().size() == 2) {
            v1 = config.getValues().get(1);
        }
        switch (config.getFilterType()) {
            case "=":
            case "eq":
                return termsQuery(fieldName, config.getValues());
            case "≠":
            case "ne":
                return getFilterPartEq(BoolType.MUST_NOT, fieldName, config.getValues());
            case ">":
                return rangeQuery(fieldName, v0, null);
            case "<":
                return rangeQuery(fieldName, null, v1);
            case "≥":
                return rangeQuery(fieldName, v0, null, true, true);
            case "≤":
                return rangeQuery(fieldName, null, v1, true, true);
            case "(a,b]":
                return rangeQuery(fieldName, v0, v1, false, true);
            case "[a,b)":
                return rangeQuery(fieldName, v0, v1, true, false);
            case "(a,b)":
                return rangeQuery(fieldName, v0, v1, false, false);
            case "[a,b]":
                return rangeQuery(fieldName, v0, v1, true, true);
        }
        return null;
    }

    private JSONObject getFilterPartEq(BoolType boolType, String fieldName, List<String> values) {
        JSONArray boolArr = new JSONArray();
        values.stream()
                .map(e -> termQuery(fieldName, e))
                .forEach(boolArr::add);
        return QueryBuilder.boolFilter(boolType, boolArr);
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

    protected JSONObject getAggregation(String columnName, AggConfig config) {
        JSONObject aggregation = null;
        try {
            Map<String, String> types = getTypes();
            JSONObject overrideAgg = getOverrideTermsAggregation(columnName);
            // For Dimension members query
//            if (config == null && "date".equals(types.get(columnName))) {
//                return buildDateHistAggregation(columnName, config);
//            }
            if (overrideAgg != null) {
                return overrideAgg;
            } else {
                switch (types.get(columnName)) {
                    case "date":
                        aggregation = buildDateHistAggregation(columnName, config);
                        break;
                    default:
                        aggregation = json(columnName, termsAggregation(columnName, 1000));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            aggregation = json(columnName, termsAggregation(columnName, 1000));
        }
        return aggregation;
    }

    protected JSONObject buildDateHistAggregation(String columnName, AggConfig config) throws Exception {
        if (config == null) {
            return queryBound(columnName, config);
        }
        String intervalStr = "10m";
        JSONObject queryDsl = buildFilterDSL(config);
        Object object = JSONPath.compile("$.." + columnName.replace(".", "\\.")).eval(queryDsl);
        List<JSONObject> array = (List) object;
        OptionalLong lowerOpt = array.stream().mapToLong(jo -> {
            Long lt1 = jo.getLong("gt");
            Long lt2 = jo.getLong("gte");
            return coalesce(lt1, lt2, Long.MAX_VALUE);
        }).min();
        OptionalLong upperOpt = array.stream().mapToLong(jo -> {
            Long lt1 = jo.getLong("lt");
            Long lt2 = jo.getLong("lte");
            return coalesce(lt1, lt2, new Date().getTime());
        }).max();
        if (!lowerOpt.isPresent() || lowerOpt.getAsLong() == Long.MAX_VALUE || lowerOpt.getAsLong() >= upperOpt.getAsLong() ) {
            return queryBound(columnName, config);
        }
        intervalStr = dateInterval(lowerOpt.getAsLong(), upperOpt.getAsLong());
        return json(columnName, dateHistAggregation(columnName, intervalStr, 0, lowerOpt.getAsLong(), upperOpt.getAsLong()));
    }

    protected JSONObject queryBound(String columnName, AggConfig config) {
        String maxKey = "max_ts";
        String minKey = "min_ts";
        JSONBuilder request = json("size", 0).
                put("aggregations", json().
                        put(minKey, json("min", json("field", columnName))).
                        put(maxKey, json("max", json("field", columnName)))
                );

        if (config != null) {
            JSONArray filter = getFilter(config);
            if (filter.size() > 0) {
                request.put("query", buildFilterDSL(config));
            }
        }

        String intervalStr = "10m";
        try {
            JSONObject response = post(getSearchUrl(request), request);
            long maxTs = coalesce(response.getJSONObject("aggregations").getJSONObject(maxKey).getLong("value"), 0l);
            long minTs = coalesce(response.getJSONObject("aggregations").getJSONObject(minKey).getLong("value"), 0l);
            intervalStr = dateInterval(minTs, maxTs);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return json(columnName, dateHistAggregation(columnName, intervalStr, 0));
    }

    protected String dateInterval(long minTs, long maxTs) {
        String intervalStr;
        long minutesOfDuration;
        int buckets = 100;
        long stepTs = (maxTs - minTs)/buckets;
        minutesOfDuration = Duration.ofMillis(stepTs).toMinutes();
        intervalStr = minutesOfDuration == 0 ? "10m" : minutesOfDuration  + "m";
        return intervalStr;
    }

    protected String getMappingUrl() {
        return String.format("http://%s/%s/_mapping/%s", dataSource.get(SERVERIP), query.get(INDEX), query.get(TYPE));
    }

    protected String getSearchUrl(JSONObject request) {
        return String.format("http://%s/%s/%s/_search", dataSource.get(SERVERIP), query.get(INDEX), query.get(TYPE));
    }

    @Override
    public String[] getColumn() throws Exception {
        typesCache.remove(getKey());
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
        JSONObject response = post(getSearchUrl(request), request);
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
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<DimensionConfig> aggregationStream = Stream.concat(c, r);
        List<JSONObject> termAggregations =
                aggregationStream.map(e -> getAggregation(e.getColumnName(), config))
                        .collect(Collectors.toList());
        JSONObject metricAggregations = getMetricAggregation(config.getValues(), getTypes());
        termAggregations.add(metricAggregations);

        JSONObject request = new JSONObject();
        for (int i = termAggregations.size() - 1; i > 0; i--) {
            JSONObject pre = termAggregations.get(i - 1);
            String key = pre.keySet().iterator().next();
            pre.getJSONObject(key).put("aggregations", termAggregations.get(i));
        }

        request.put("size", 0);
        request.put("query", buildFilterDSL(config));
        request.put("aggregations", termAggregations.get(0));
        return request;
    }

    public JSONObject buildFilterDSL(AggConfig config) {
        return boolFilter(BoolType.FILTER, getFilter(config));
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
                case "distinct":
                    type = "cardinality";
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
        JSONObject property = (JSONObject) field.getValue();
        if (property.keySet().contains("properties")) {
            for (Map.Entry e : property.getJSONObject("properties").entrySet()) {
                String key = field.getKey();
                if (parent != null) {
                    key = parent + "." + field.getKey();
                }
                getField(types, e, key);
            }
        } else {
            String key = null;
            String type = property.getString("type");
            if (parent == null) {
                key = field.getKey();
            } else {
                key = parent + "." + field.getKey();
            }
            if (isTextWithoutKeywordField(property)) {
                return;
            }
            if (isTextWithKeywordField(property)) {
                key += ".keyword";
            }
            types.put(key, type);
        }
    }

    private boolean isTextWithKeywordField(JSONObject property) {
        String type = property.getString("type");
        return "text".equals(type) && JSONPath.containsValue(property, "$.fields..type", "keyword");
    }

    private boolean isTextWithoutKeywordField(JSONObject property) {
        String type = property.getString("type");
        return "text".equals(type) && !JSONPath.containsValue(property, "$.fields..type", "keyword");
    }

    @Override
    public String viewAggDataQuery(AggConfig ac) throws Exception {
        String format = "curl -XPOST '%s?pretty' -d '\n%s'";
        JSONObject request = getQueryAggDataRequest(ac);
        String dsl = JSON.toJSONString(request, true);
        return String.format(format, getSearchUrl(request), dsl);
    }


    @Override
    public void afterPropertiesSet() throws Exception {
        if (StringUtils.isNotBlank(query.get(OVERRIDE))) {
            overrideAggregations = JSONObject.parseObject(query.get(OVERRIDE));
        }
    }

}
