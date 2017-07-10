package org.cboard.solr;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.collect.Ordering;
import com.google.common.hash.Hashing;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.LBHttpSolrServer;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocumentList;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.DataProviderManager;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.exception.CBoardException;
import org.reflections.ReflectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.util.*;

/**
 * Created by JunjieM on 2017-7-7.
 */
@ProviderName(name = "Solr")
public class SolrDataProvider extends DataProvider {

    private static final Logger LOG = LoggerFactory.getLogger(SolrDataProvider.class);

    @Value("${dataprovider.resultLimit:300000}")
    private int resultLimit;

    @DatasourceParameter(label = "{{'DATAPROVIDER.SOLR.SOLR_SERVERS'|translate}}", placeholder = "<ip>:<port>,[<ip>:<port>]...", type = DatasourceParameter.Type.Input, order = 1)
    private String solrServers = "solrServers";

    @QueryParameter(label = "{{'DATAPROVIDER.SOLR.COLLECTION'|translate}}", pageType = "test,dataset,widget", type = QueryParameter.Type.Input, order = 1)
    private String collection = "collection";

    @QueryParameter(label = "{{'DATAPROVIDER.SOLR.Q'|translate}}", pageType = "dataset,widget", value = "*:*", placeholder = "*:*|<fieldName>:<fieldValue>[ <AND|OR> <fieldName>:<fieldValue>]...", type = QueryParameter.Type.TextArea2, order = 2)
    private String q = "q";

    @QueryParameter(label = "{{'DATAPROVIDER.SOLR.FQ'|translate}}", pageType = "dataset,widget", placeholder = "<fieldName>:<fieldValue>[,<fieldName>:<fieldValue>]...", type = QueryParameter.Type.Input, order = 3)
    private String fq = "fq";

    @QueryParameter(label = "{{'DATAPROVIDER.SOLR.SORT'|translate}}", pageType = "dataset,widget", placeholder = "<fieldName> <ASC|DESC>[,<fieldName> <ASC|DESC>]...", type = QueryParameter.Type.Input, order = 4)
    private String sort = "sort";

    @QueryParameter(label = "{{'DATAPROVIDER.SOLR.START'|translate}}", pageType = "dataset,widget", value = "0", placeholder = "default value is 0", type = QueryParameter.Type.Number, order = 5)
    private String start = "start";

    @QueryParameter(label = "{{'DATAPROVIDER.SOLR.ROWS'|translate}}", pageType = "dataset,widget", value = "10", placeholder = "default value is 10", type = QueryParameter.Type.Number, order = 6)
    private String rows = "rows";

    @QueryParameter(label = "{{'DATAPROVIDER.SOLR.FL'|translate}}", pageType = "dataset,widget", placeholder = "*|<fieldName>[,<fieldName>]...", type = QueryParameter.Type.Input, order = 7)
    private String fl = "fl";

    @DatasourceParameter(label = "{{'DATAPROVIDER.POOLEDCONNECTION'|translate}}", type = DatasourceParameter.Type.Checkbox, order = 5)
    private String pooled = "pooled";

    private static Map<String, SolrServerPoolFactory> poolMap;

    @Override
    public boolean doAggregationInDataSource() {
        return false;
    }

    private synchronized SolrServerPoolFactory getSolrServerPoolFactory(String solrServers, String collectionName) {
        String poolKey = getPoolKey(solrServers, collectionName);
        if (poolMap == null) {
            poolMap = new HashMap();
        }
        SolrServerPoolFactory factory = poolMap.get(poolKey);
        if (factory == null) {
            GenericObjectPoolConfig config = new GenericObjectPoolConfig();
            config.setMaxTotal(10);
            config.setLifo(true);
            config.setMinIdle(1);
            config.setMaxTotal(10);
            config.setMaxWaitMillis(3000);
            config.setTimeBetweenEvictionRunsMillis(30000);
            config.setTestWhileIdle(true);
            config.setTestOnBorrow(false);
            config.setTestOnReturn(false);
            factory = new SolrServerPoolFactory(config, solrServers, collectionName);
        }
        poolMap.put(poolKey, factory);
        return factory;
    }

    private SolrServer getConnection(String solrServers, String collectionName) {
        String usePool = dataSource.get(pooled);
        SolrServer solrServer = null;
        if (usePool != null && "true".equals(usePool)) {
            solrServer = getSolrServerPoolFactory(solrServers, collectionName).getConnection();
        } else {
            solrServer = getSolrServer(solrServers, collectionName);
        }
        return solrServer;
    }

    private void releaseConnection(String solrServers, String collectionName, SolrServer solrServer) {
        getSolrServerPoolFactory(solrServers, collectionName).releaseConnection(solrServer);
    }

    private SolrQuery getSolrQuery() {
        SolrQuery solrQuery = new SolrQuery();

        String q = StringUtils.isBlank(query.get("q")) ? "*:*" : query.get("q");
        String fqs = StringUtils.isBlank(query.get("fq")) ? "" : query.get("fq");
        String fl = StringUtils.isBlank(query.get("fl")) ? "" : query.get("fl");
        String sort = StringUtils.isBlank(query.get("sort")) ? "" : query.get("sort");
        int start = StringUtils.isBlank(query.get("start")) ? 0 : Integer.parseInt(query.get("start"));
        int rows = StringUtils.isBlank(query.get("rows")) ? 10 : Integer.parseInt(query.get("rows"));

        solrQuery.set("q", q);
        String[] fqArr = fqs.split(",");
        for (String fq : fqArr)
            solrQuery.set("fq", fq.trim());
        solrQuery.set("fl", fl);
        solrQuery.set("sort", sort);
        solrQuery.setStart(start);
        solrQuery.setRows(rows);

        LOG.debug("solrQuery=" + solrQuery.toString());
        return solrQuery;
    }

    private QueryResponse getQueryResponse(String solrServers, String collectionName) {
        SolrServer solrServer = null;
        QueryResponse res = null;
        try {
            solrServer = getConnection(solrServers, collectionName);
            res = solrServer.query(getSolrQuery());
        } catch (SolrServerException e) {
            e.printStackTrace();
        } finally {
            if (solrServer != null) {
                releaseConnection(solrServers, collectionName, solrServer);
            }
        }
        return res;
    }

    private String getPoolKey(String solrServers, String collectionName) {
        return Hashing.md5().newHasher().putString(solrServers + "_" + collectionName, Charsets.UTF_8).hash().toString();
    }

    private String getCacheKey() {
        return Hashing.md5().newHasher().putString(JSONObject.toJSON(dataSource).toString() + JSONObject.toJSON(query).toString(), Charsets.UTF_8).hash().toString();
    }

    private SolrServer getSolrServer(String solrServers, String collectionName) {
        String[] tempServers = solrServers.split(",");
        String[] servers = new String[tempServers.length];
        for (int i = 0; i < tempServers.length; i++) {
            servers[i] = "http://" + tempServers[i] + "/solr/" + collectionName;
        }
        SolrServer solrServer = null;
        try {
            solrServer = new LBHttpSolrServer(servers);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        return solrServer;
    }

    @Override
    public String[][] getData() throws Exception {
        String solrServers = dataSource.get("solrServers");
        if (StringUtils.isBlank(solrServers))
            throw new CBoardException("Datasource config Solr Servers can not be empty.");
        String collectionName = query.get("collection");
        if (StringUtils.isBlank(collectionName))
            throw new CBoardException("Collection can not be empty.");

        QueryResponse qs = getQueryResponse(solrServers, collectionName);

        if (qs == null || qs.getResults().size() == 0) {
            return new String[0][0];
        }

        SolrDocumentList results = qs.getResults();
        Set<Map.Entry<String, Object>> entrySet = results.get(0).entrySet();
        String[][] strings = new String[results.size() + 1][entrySet.size()];

        // 字段行
        int col = 0;
        for (Map.Entry<String, Object> entry : entrySet) {
            strings[0][col] = entry.getKey();
            col++;
        }

        if (results.size() > resultLimit) {
            throw new CBoardException("Cube result count is greater than limit " + resultLimit);
        }

        // 数据集
        for (int i = 1; i <= results.size(); i++) {
            int j = 0;
            for (Map.Entry<String, Object> e : entrySet) {
                strings[i][j] = String.valueOf(results.get(i - 1).get(e.getKey()));
                j++;
            }
        }

        return strings;
    }

    private static Ordering<Field> fieldOrdering = Ordering.from(new Comparator<Field>() {
        @Override
        public int compare(Field o1, Field o2) {
            return Integer.compare(getOrder(o1), getOrder(o2));
        }

        private int getOrder(Field field) {
            field.setAccessible(true);
            DatasourceParameter datasourceParameter = field.getAnnotation(DatasourceParameter.class);
            if (datasourceParameter != null) {
                return datasourceParameter.order();
            }
            QueryParameter queryParameter = field.getAnnotation(QueryParameter.class);
            if (queryParameter != null) {
                return queryParameter.order();
            }
            return 0;
        }
    });
}