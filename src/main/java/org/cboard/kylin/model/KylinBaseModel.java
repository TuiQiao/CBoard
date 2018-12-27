package org.cboard.kylin.model;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.collections.map.HashedMap;
import org.cboard.exception.CBoardException;
import org.cboard.kylin.KylinDataProvider;
import org.cboard.kylin.TableMap;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthorizationInterceptor;
import org.springframework.web.client.RestTemplate;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by zyong on 2017/11/30.
 */
public abstract class KylinBaseModel implements Serializable {

    JSONObject model;
    String[] kylinVersion;
    Map<String, String> query, dataSource;
    Map<String, String> columnTable = new HashedMap();
    /**
     * key: table alias , value : full table name <BR/>
     * because one look up table may have multy alias
     */
    Map<String, String> tableAlias = new TableMap();
    Map<String, String> columnType = new HashedMap();
    static final String QUOTATAION = "\"";

    String serverIp, username, password;

    public KylinBaseModel(JSONObject model, Map<String, String> dataSource, Map<String, String> query, String[] version) throws Exception {
        if (model == null) {
            throw new CBoardException("Model not found");
        }
        this.serverIp = dataSource.get(KylinDataProvider.SERVERIP);
        this.username = dataSource.get(KylinDataProvider.USERNAME);
        this.password = dataSource.get(KylinDataProvider.PASSWORD);
        this.model = model;
        this.dataSource = dataSource;
        this.query = query;
        this.kylinVersion = version;
        initMetaData();
    }

    /**
     * @param column
     * @return alias."column"
     */
    public String getColumnWithAliasPrefix(String column) {
        return tableAlias.get(columnTable.get(column)) + "." + surroundWithQuta(column);
    }

    public ResponseEntity<String> getTableInfoRest(RestTemplate restTemplate, String table) {
        return restTemplate.getForEntity("http://" + serverIp + "/kylin/api/tables/{tableName}", String.class, table);
    }

    /**
     *
     * @param table
     */
    public String getTableWithAliasSuffix(String table) {
        return table + " " + tableAlias.get(table);
    }

    public String getTableOfColumn(String column) {
        return columnTable.get(column);
    }

    public String getTableAlias(String table) {
        return tableAlias.get(table);
    }

    public Map<String, String> initColumnsDataType(String table) {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add(new BasicAuthorizationInterceptor(username, password));
        ResponseEntity<String> a = getTableInfoRest(restTemplate, table);
        JSONObject jsonObject = JSONObject.parseObject(a.getBody());
        Map<String, String> result = new HashedMap();
        jsonObject.getJSONArray("columns").stream().map(e -> (JSONObject) e).forEach(e -> result.put(e.getString("name"), e.getString("datatype")));
        return result;
    }

    public String getColumnType(String column) {
        return columnType.get(column);
    }

    abstract void initMetaData() throws Exception;

    public String geModelSql() {
        String factTable = formatTableName(model.getString("fact_table"));
        return String.format("%s %s %s", factTable, tableAlias.get(factTable), getJoinSql(tableAlias.get(factTable)));
    }

    private String getJoinSql(String factAlias) {
        String s = model.getJSONArray("lookups").stream().map(e -> {
            JSONObject j = (JSONObject) e;
            String[] pk = j.getJSONObject("join").getJSONArray("primary_key").stream().map(p -> p.toString()).toArray(String[]::new);
            String[] fk = j.getJSONObject("join").getJSONArray("foreign_key").stream().map(p -> p.toString()).toArray(String[]::new);
            List<String> on = new ArrayList<>();
            for (int i = 0; i < pk.length; i++) {
                on.add(String.format("%s.%s = %s.%s", tableAlias.get(j.getString("table")),
                        surroundWithQuta(pk[i]), factAlias, surroundWithQuta(fk[i])));
            }
            String type = j.getJSONObject("join").getString("type").toUpperCase();
            String pTable = formatTableName(j.getString("table"));
            String onStr = on.stream().collect(Collectors.joining(" and "));
            return String.format("\n %s JOIN %s %s ON %s", type, pTable, tableAlias.get(pTable), onStr);
        }).collect(Collectors.joining(" "));
        return s;
    }

    /**
     * Return Array[alias.column]
     * @return
     */
    public abstract String[] getColumns();

    public String formatTableName(String rawName) {
        String tmp = rawName.replaceAll("\"", "");
        StringJoiner joiner = new StringJoiner(".");
        Arrays.stream(tmp.split("\\.")).map(i -> surroundWithQuta(i)).forEach(joiner::add);
        return joiner.toString();
    }
    
    public String getAliasfromColumn(String columnName) {
        return columnName.split("\\.")[0];
    }

    protected String surroundWithQuta(String text) {
        return QUOTATAION + text + QUOTATAION;
    }
}