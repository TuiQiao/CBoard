package org.cboard.saiku;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import com.google.common.base.Joiner;
import org.apache.commons.lang3.math.NumberUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

/**
 * Created by yfyuan on 2016/8/15.
 */
@ProviderName(name = "saiku")
public class SaikuDataProvider extends DataProvider {

    @DatasourceParameter(label = "Saiku Server (http://domain:port)",
            type = DatasourceParameter.Type.Input,
            order = 1)
    private String SERVERIP = "serverIp";

    @DatasourceParameter(label = "User Name (for Saiku Server)",
            type = DatasourceParameter.Type.Input,
            order = 2)
    private String USERNAME = "username";

    @DatasourceParameter(label = "Password",
            type = DatasourceParameter.Type.Password,
            order = 3)
    private String PASSWORD = "password";

    @QueryParameter(label = "Repo Path of Report",
            type = QueryParameter.Type.Input)
    private String FILE = "file";

    @Override
    public boolean doAggregationInDataSource() {
        return false;
    }

    @Override
    public String[][] getData() throws Exception {
        String serverIp = dataSource.get(SERVERIP);
        String username = dataSource.get(USERNAME);
        String password = dataSource.get(PASSWORD);

        String file = query.get(FILE);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> a = restTemplate.postForEntity(serverIp + "/saiku/rest/saiku/session?username={username}&password={password}", null, String.class, username, password);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cookie", Joiner.on(";").join(a.getHeaders().get("Set-Cookie")));

        String uuid = UUID.randomUUID().toString();
        restTemplate.exchange(serverIp + "/saiku/rest/saiku/api/query/{id}?file={file}&formatter={formatter}&type={type}", HttpMethod.POST, new HttpEntity<>(headers), String.class, uuid, file, "flattened", "QM");
        a = restTemplate.exchange(serverIp + "/saiku/rest/saiku/api/query/{id}/result/flattened", HttpMethod.GET, new HttpEntity<>(headers), String.class, uuid);
        JSONObject jsonObject = JSONObject.parseObject(new String(a.getBody().getBytes("ISO8859-1"), "UTF-8"));
        JSONArray array = jsonObject.getJSONArray("cellset");

        String[] columnHeader = new String[jsonObject.getInteger("width")];
        int i;
        for (i = 0; i < array.size(); i++) {
            JSONArray cols = array.getJSONArray(i);
            if ("ROW_HEADER".equals(cols.getJSONObject(0).get("type"))) {
                break;
            } else {
                for (int j = 0; j < cols.size(); j++) {
                    String value = cols.getJSONObject(j).getString("value");
                    if (columnHeader[j] == null) {
                        columnHeader[j] = value.equals("null") ? "" : value;
                    } else {
                        columnHeader[j] += value.equals("null") ? "" : value;
                    }
                }
            }
        }

        String[][] result = new String[jsonObject.getInteger("height") - (i - 1)][jsonObject.getInteger("width")];
        result[0] = columnHeader;
        String[] rowHeader = new String[jsonObject.getInteger("width")];
        for (int j = i; j < array.size(); j++) {
            JSONArray cols = array.getJSONArray(j);
            for (int k = 0; k < cols.size(); k++) {
                if ("DATA_CELL".equals(cols.getJSONObject(k).getString("type"))) {
                    String raw = cols.getJSONObject(k).getJSONObject("properties").getString("raw");
                    if (NumberUtils.isNumber(raw)) {
                        result[j - i + 1][k] = raw;
                    } else {
                        result[j - i + 1][k] = "0";
                    }
                } else {
                    String v = cols.getJSONObject(k).getString("value");
                    if (!"null".equals(v)) {
                        result[j - i + 1][k] = cols.getJSONObject(k).getString("value");
                        rowHeader[k] = cols.getJSONObject(k).getString("value");
                    } else {
                        result[j - i + 1][k] = rowHeader[k];
                    }

                }
            }
        }

        return result;
    }
}
