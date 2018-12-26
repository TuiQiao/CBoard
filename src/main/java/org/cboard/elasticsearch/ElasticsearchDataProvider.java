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
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.fluent.Request;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.HttpClientBuilder;
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
import org.cboard.util.json.JSONBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.cboard.elasticsearch.aggregation.AggregationBuilder.dateHistAggregation;
import static org.cboard.elasticsearch.aggregation.AggregationBuilder.termsAggregation;
import static org.cboard.elasticsearch.query.QueryBuilder.*;
import static org.cboard.util.SqlMethod.coalesce;

/**
 * Created by yfyuan on 2017/3/17.
 */
@ProviderName(name = "Elasticsearch")
public class ElasticsearchDataProvider extends DataProvider implements Aggregatable, Initializing {

    private static final Logger LOG = LoggerFactory.getLogger(ElasticsearchDataProvider.class);

    @DatasourceParameter(label = "Elasticsearch Server *",
            type = DatasourceParameter.Type.Input,
            value = "localhost:9200",
            placeholder = "domain:port",
            required = true, order = 1)
    protected String SERVERIP = "serverIp";

    @QueryParameter(label = "Index *",
            type = QueryParameter.Type.Input,
            required = true,
            order = 2)
    protected String INDEX = "index";

    @QueryParameter(label = "Type *",
            type = QueryParameter.Type.Input,
            required = true,
            order = 3)
    protected String TYPE = "type";

    @DatasourceParameter(label = "UserName (Optional)",
            type = DatasourceParameter.Type.Input,
            order = 4)
    private String USERNAME = "username";

    @DatasourceParameter(label = "Password (Optional)",
            type = DatasourceParameter.Type.Password,
            order = 5)
    private String PASSWORD = "password";

    @QueryParameter(label = "Override Aggregations",
            pageType = "dataset,widget",
            type = QueryParameter.Type.TextArea,
            order = 6)
    private String OVERRIDE = "override";

    @DatasourceParameter(label = "Charset (Default: utf-8)",
            type = DatasourceParameter.Type.Input,
            order = 7)
    private String CHARSET = "charset";

    private JSONObject overrideAggregations = new JSONObject();

    private static final CacheManager<Map<String, String>> typesCache = new HeapCacheManager<>();

    private static final JSONPath jsonPath_value = JSONPath.compile("$..value");

    private static final List<String> numericTypes = new ArrayList<>();

    private static final Integer NULL_NUMBER = -999;

    static {
        numericTypes.add("long");
        numericTypes.add("integer");
        numericTypes.add("short");
        numericTypes.add("byte");
        numericTypes.add("double");
        numericTypes.add("float");
    }

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
                .map(e -> ((JSONObject) e).getString("key"))
                .map(e -> e.replaceAll(NULL_NUMBER.toString(), NULL_STRING))
                .toArray(String[]::new);
        return filtered;
    }

    private JSONArray getFilter(AggConfig config) {
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<ConfigComponent> f = config.getFilters().stream();
        Stream<ConfigComponent> filters = Stream.concat(Stream.concat(c, r), f);
        JSONArray result = new JSONArray();
        filters.map(e -> separateNull(e)).map(e -> configComponentToFilter(e)).filter(e -> e != null).forEach(result::add);
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
            compositeConfig.getConfigComponents().stream().map(e -> separateNull(e)).map(e -> configComponentToFilter(e)).forEach(boolArr::add);
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
        if (NULL_STRING.equals(v0)) {
            switch (config.getFilterType()) {
                case "=":
                case "≠":
                    return nullQuery(fieldName, "=".equals(config.getFilterType()));
            }
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
                return rangeQuery(fieldName, null, v0);
            case "≥":
                return rangeQuery(fieldName, v0, null, true, true);
            case "≤":
                return rangeQuery(fieldName, null, v0, true, true);
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
        HttpResponse httpResponse = null;
        String userName = dataSource.get(USERNAME);
        String password = dataSource.get(PASSWORD);
        String chartset = dataSource.get(CHARSET) == null ? "utf-8" : dataSource.get(CHARSET);
        if (StringUtils.isEmpty(userName) || StringUtils.isEmpty(password)) {
            httpResponse = Request.Post(url).bodyString(request.toString(), ContentType.APPLICATION_JSON).execute().returnResponse();
        } else {
            HttpClientBuilder httpClientBuilder = HttpClientBuilder.create();
            HttpPost httpPost = new HttpPost(url);
            StringEntity reqEntity = new StringEntity(request.toString());
            httpPost.setEntity(reqEntity);
            httpResponse = httpClientBuilder.build().execute(httpPost, getHttpContext());
        }

        String response = EntityUtils.toString(httpResponse.getEntity(), chartset);
        if (httpResponse.getStatusLine().getStatusCode() == 200) {
            return JSONObject.parseObject(response);
        } else {
            throw new Exception(response);
        }
    }

    protected JSONObject get(String url) throws Exception {
        HttpClientBuilder httpClientBuilder = HttpClientBuilder.create();
        HttpGet httpget = new HttpGet(url);
        HttpResponse response = httpClientBuilder.build().execute(httpget, getHttpContext());
        return JSONObject.parseObject(EntityUtils.toString(response.getEntity(), dataSource.get(CHARSET)));
    }

    private HttpClientContext getHttpContext() {

        HttpClientContext context = HttpClientContext.create();
        String userName = dataSource.get(USERNAME);
        String password = dataSource.get(PASSWORD);

        if (StringUtils.isEmpty(userName) || StringUtils.isEmpty(password)) {
            return context;
        }

        CredentialsProvider provider = new BasicCredentialsProvider();
        provider.setCredentials(
                new AuthScope(AuthScope.ANY),
                new UsernamePasswordCredentials(userName, password)
        );
        context.setCredentialsProvider(provider);
        AuthCache authCache = new BasicAuthCache();
        context.setAuthCache(authCache);
        return context;
    }

    private JSONObject getOverrideTermsAggregation(String columnName) {
        if (overrideAggregations.containsKey(columnName)) {
            JSONObject override = new JSONObject();
            override.put(columnName, overrideAggregations.getJSONObject(columnName));
            return override;
        }
        return null;
    }

    private JSONObject getAggregation(String columnName, AggConfig config) {
        DimensionConfig d = new DimensionConfig();
        d.setColumnName(columnName);
        return getAggregation(d, config);
    }

    private JSONObject getAggregation(DimensionConfig d, AggConfig config) {
        JSONObject aggregation = null;
        try {
            Map<String, String> types = getTypes();
            JSONObject overrideAgg = getOverrideTermsAggregation(d.getColumnName());

            // Build default aggregation
            switch (types.get(d.getColumnName())) {
                case "date":
                    aggregation = buildDateHistAggregation(d.getColumnName(), config);
                    break;
                default:
                    Object missing = numericTypes.contains(getTypes().get(d.getColumnName())) ? NULL_NUMBER : NULL_STRING;
                    aggregation = json(d.getColumnName(), termsAggregation(d.getColumnName(), 1000, missing));
            }
            // Query Override
            if (overrideAgg != null) {
                aggregation = overrideAgg;
            }
            // Schema Override
            if (StringUtils.isNotEmpty(d.getCustom())) {
                aggregation = json(d.getColumnName(), JSONObject.parseObject(d.getCustom()).get("esBucket"));
            }
        } catch (Exception e) {
            LOG.error("", e);
        }
        return aggregation;
    }

    private JSONObject buildDateHistAggregation(String columnName, AggConfig config) throws Exception {
        if (config == null) {
            return queryBound(columnName, config);
        }
        String intervalStr = "10m";
        JSONObject queryDsl = buildFilterDSL(config);
        Object object = JSONPath.compile("$.." + columnName.replace(".", "\\.")).eval(queryDsl);
        List<JSONObject> array = (List) object;
        Long lower = array.stream()
                .map(jo -> coalesce(jo.getLong("gt"), jo.getLong("gte")))
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);
        Long upper = array.stream()
                .map(jo -> coalesce(jo.getLong("lt"), jo.getLong("lte")))
                .filter(Objects::nonNull)
                .min(Comparator.naturalOrder())
                .orElse(new Date().getTime());

        if (lower == null || lower >= upper) {
            return queryBound(columnName, config);
        }
        intervalStr = dateInterval(lower, upper);
        return json(columnName, dateHistAggregation(columnName, intervalStr, 0, lower, upper));
    }

    private JSONObject queryBound(String columnName, AggConfig config) {
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
            LOG.error("", e);
        }
        return json(columnName, dateHistAggregation(columnName, intervalStr, 0));
    }

    protected String dateInterval(long minTs, long maxTs) {
        String intervalStr = "1m";
        int buckets = 100;
        long stepTs = (maxTs - minTs) / buckets;
        long minutesOfDuration = Duration.ofMillis(stepTs).toMinutes();
        long secondsOfDuration = Duration.ofMillis(stepTs).toMillis() / 1000;
        if (minutesOfDuration > 0) {
            intervalStr = minutesOfDuration + "m";
        } else if (secondsOfDuration > 0) {
            intervalStr = secondsOfDuration + "s";
        }
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
        Map<String, String> types = getTypes();
        int[] numericIdx = dimensionList.stream().filter(e -> numericTypes.contains(types.get(e.getName())))
                .map(e -> e.getIndex()).mapToInt(e -> e).toArray();
        for (String[] strings : _result) {
            for (int i : numericIdx) {
                strings[i] = strings[i].replaceAll(NULL_NUMBER.toString(), NULL_STRING);
            }
        }
        return new AggregateResult(columnList, _result);
    }

    private JSONObject getQueryAggDataRequest(AggConfig config) throws Exception {
        Stream<DimensionConfig> c = config.getColumns().stream();
        Stream<DimensionConfig> r = config.getRows().stream();
        Stream<DimensionConfig> aggregationStream = Stream.concat(c, r);
        List<JSONObject> termAggregations =
                aggregationStream.map(e -> getAggregation(e, config))
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
        return null;
    }

    @Override
    public void test() throws Exception {
        HttpClientBuilder httpClientBuilder = HttpClientBuilder.create();
        HttpGet httpget = new HttpGet(getMappingUrl());
        HttpResponse httpResponse = httpClientBuilder.build().execute(httpget, getHttpContext());
        String response = EntityUtils.toString(httpResponse.getEntity(), dataSource.get(CHARSET));
        if (httpResponse.getStatusLine().getStatusCode() != 200) {
            throw new Exception(response);
        }
    }

    private String getKey() {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    private void getField(Map<String, String> types, Entry<String, Object> field, String parent) {
        JSONObject property = (JSONObject) field.getValue();
        if (property.keySet().contains("properties")) {
            for (Entry e : property.getJSONObject("properties").entrySet()) {
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
