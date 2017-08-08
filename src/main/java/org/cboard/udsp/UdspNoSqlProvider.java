package org.cboard.udsp;

import com.hex.bigdata.udsp.client.factory.ConsumerClientFactory;
import com.hex.bigdata.udsp.client.impl.NoSqlClient;
import com.hex.bigdata.udsp.constant.SdkConstant;
import com.hex.bigdata.udsp.model.Page;
import com.hex.bigdata.udsp.model.request.NoSqlRequest;
import com.hex.bigdata.udsp.model.response.pack.SyncPackResponse;
import org.apache.commons.lang3.StringUtils;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.exception.CBoardException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by JunjieM on 2017-7-11.
 */
@ProviderName(name = "UdspNoSql")
public class UdspNoSqlProvider extends DataProvider {
    private static final Logger LOG = LoggerFactory.getLogger(UdspNoSqlProvider.class);

    @Value("${dataprovider.resultLimit:300000}")
    private int resultLimit;

    @DatasourceParameter(label = "{{'DATAPROVIDER.UDSP.UDSP_SERVERS'|translate}}", required = true, placeholder = "<ip>:<port>", type = DatasourceParameter.Type.Input, order = 1)
    private String UDSP_SERVERS = "udspServers";

    @DatasourceParameter(label = "{{'DATAPROVIDER.UDSP.USERNAME'|translate}}", type = DatasourceParameter.Type.Input, order = 2)
    private String USERNAME = "username";

    @DatasourceParameter(label = "{{'DATAPROVIDER.UDSP.PASSWORD'|translate}}", type = DatasourceParameter.Type.Password, order = 3)
    private String PASSWORD = "password";

    @QueryParameter(label = "{{'DATAPROVIDER.UDSP.SERVICE_NAME'|translate}}", required = true, type = QueryParameter.Type.Input, order = 1)
    private String SERVICE_NAME = "serviceName";

    @QueryParameter(label = "{{'DATAPROVIDER.UDSP.JSON_TEXT'|translate}}", required = true, placeholder = "exemple: {field1:1111,field2:'test'}", type = QueryParameter.Type.TextArea2, order = 2)
    private String JSON = "json";

    @QueryParameter(label = "{{'DATAPROVIDER.UDSP.PAGE_INDEX'|translate}}", required = true, pageType = "dataset,widget", value = "1", placeholder = "default value is 1", type = QueryParameter.Type.Number, order = 3)
    private String PAGE_INDEX = "pageIndex";

    @QueryParameter(label = "{{'DATAPROVIDER.UDSP.PAGE_SIZE'|translate}}", required = true, pageType = "dataset,widget", value = "10", placeholder = "default value is 10", type = QueryParameter.Type.Number, order = 4)
    private String PAGE_SIZE = "pageSize";

    private String getUrl() {
        String udspServers = dataSource.get(UDSP_SERVERS);
        if (StringUtils.isBlank(udspServers))
            throw new CBoardException("Datasource config UDSP Servers can not be empty.");
        String url = "http://" + udspServers + "/udsp/http/consume";
        LOG.info("UDSP url: " + url);
        return url;
    }

    private NoSqlRequest getRequest() {
        String username = dataSource.get(USERNAME);
        if (StringUtils.isBlank(username))
            throw new CBoardException("Datasource config Username can not be empty.");
        String password = dataSource.get(PASSWORD);
        if (StringUtils.isBlank(password))
            throw new CBoardException("Datasource config Password can not be empty.");
        String serviceName = query.get(SERVICE_NAME);
        if (StringUtils.isBlank(serviceName))
            throw new CBoardException("Dataset config ServiceName can not be empty.");
        String json = query.getOrDefault(JSON, "");
        LOG.info("JSON String: " + json);
        Map<String, String> data = null;
        try {
            data = (Map<String, String>) com.alibaba.fastjson.JSON.parse(json);
        } catch (Exception e) {
            e.printStackTrace();
            throw new CBoardException(e.getMessage());
        }
        int pageIndex = StringUtils.isBlank(query.get(PAGE_INDEX)) ? 1 : Integer.parseInt(query.get(PAGE_INDEX));
        int pageSize = StringUtils.isBlank(query.get(PAGE_SIZE)) ? 10 : Integer.parseInt(query.get(PAGE_SIZE));
        Page page = new Page();
        page.setPageIndex(pageIndex);
        page.setPageSize(pageSize);

        NoSqlRequest request = new NoSqlRequest();
        request.setServiceName(serviceName);
        request.setEntity(SdkConstant.CONSUMER_ENTITY_START);
        request.setType(SdkConstant.CONSUMER_TYPE_SYNC);
        request.setUdspUser(username);
        request.setToken(password);
        request.setAppUser("admin");
        request.setData(data);
        request.setPage(page);

        return request;
    }

    @Override
    public String[][] getData() throws Exception {
        LOG.debug("Execute UdspNoSqlProvider.getData() Start!");
        List<Map<String, String>> results = getResults(getRequest());
        List<String[]> list = getHeaderAndDatas(results);
        return list.toArray(new String[][]{});
    }

    private List<Map<String, String>> getResults(NoSqlRequest request) {
        NoSqlClient client = ConsumerClientFactory.createCustomClient(NoSqlClient.class,getUrl());
        SyncPackResponse response = null;
        try {
            response = client.syncStart(request);
        } catch (Throwable t) {
            t.printStackTrace();
            throw new CBoardException(t.getMessage());
        }
        if ("DEFEAT".equals(response.getStatus())) {
            throw new CBoardException(response.getMessage());
        }
        List<Map<String, String>> results = response.getRecords();
        if (results == null || results.size() == 0) {
            throw new CBoardException("dataset is null");
        }
        if (results.size() > resultLimit) {
            throw new CBoardException("Cube result count is greater than limit " + resultLimit);
        }
        return results;
    }

    private List<String[]> getHeaderAndDatas(List<Map<String, String>> results) {
        List<String[]> list = new LinkedList<>();
        String[] columns = getColumns(results);
        list.add(columns);
        list.addAll(getDatas(results, columns));
        return list;
    }

    private List<String[]> getDatas(List<Map<String, String>> results, String[] columns){
        List<String[]> list = new LinkedList<>();
        for (int i = 0; i < results.size(); i++) {
            list.add(getValues(columns, results.get(i)));
        }
        return list;
    }

    private String[] getValues(String[] columns, Map<String, String> map) {
        Set<Map.Entry<String, String>> entrySet = map.entrySet();
        String[] row = new String[entrySet.size()];
        int i = 0;
        for (String col : columns) {
            row[i++] = map.get(col);
        }
        return row;
    }

    private String[] getColumns(List<Map<String, String>> results) {
        Set<Map.Entry<String, String>> entrySet = results.get(0).entrySet();
        int i = 0;
        String[] row = new String[entrySet.size()];
        for (Map.Entry<String, String> entry : entrySet) {
            row[i++] = entry.getKey();
        }
        return row;
    }

    @Override
    public boolean doAggregationInDataSource() {
        return false;
    }
}
