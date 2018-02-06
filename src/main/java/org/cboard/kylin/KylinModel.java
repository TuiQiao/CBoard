package org.cboard.kylin;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.TypeReference;
import org.apache.commons.collections.map.HashedMap;
import org.cboard.exception.CBoardException;
import org.cboard.util.TypeEnum;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthorizationInterceptor;
import org.springframework.web.client.RestTemplate;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by zyong on 2017/4/11.
 */
class KylinModel implements Serializable {
    private JSONObject model;
    private Map<String, String> columnTable = new HashedMap();
    private Map<String, String> tableAlias = new TableMap();
    private Map<String, String> columnType = new HashedMap();
    private static final String QUOTATAION = "\"";
    private final String PROJECT = "project";

    public String getColumnAndAlias(String column) {
        return tableAlias.get(columnTable.get(column)) + "." + surroundWithQuta(column);
    }

    public String getTable(String column) {
        return columnTable.get(column);
    }

    public String getTableAlias(String table) {
        return tableAlias.get(table);
    }

    private Map<String, String> getColumnsType(Map<String, String> query, String table, String serverIp, String username, String password) {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add(new BasicAuthorizationInterceptor(username, password));
        ResponseEntity<String> a = restTemplate.getForEntity("http://" + serverIp + "/kylin/api/tables_and_columns?project=" + query.get(PROJECT), String.class);
//        ResponseEntity<String> a = restTemplate.getForEntity("http://" + serverIp + "/kylin/api/tables/{tableName}", String.class, table);
        Map<String, String> result = new HashedMap();
        JSONArray jsonArray = JSON.parseArray(a.getBody());
        for (int i = 0; i < jsonArray.size(); i++) {
            JSONObject tableObject = (JSONObject) jsonArray.get(i);
            if (!table.equals(tableObject.get("table_SCHEM")+"."+tableObject.get("table_NAME")))
                continue;
            tableObject.getJSONArray("columns").stream().map(e -> (JSONObject) e).forEach(e -> result.put(e.getString("column_NAME"), getType(e.getInteger("data_TYPE"))));
        }
//        JSONObject jsonObject = JSONObject.parseObject(a.getBody());
//        jsonObject.getJSONArray("columns").stream().map(e -> (JSONObject) e).forEach(e -> result.put(e.getString("name"), e.getString("datatype")));
        return result;
    }

    private String getType(Integer index) {
        String name = null;
        for (TypeEnum s : TypeEnum.values()) {
            if (!index.equals(s.getIndex()))
                continue;
            name = s.getName();
            break;
        }
        return name;
    }

    public String getColumnType(String column) {
        return columnType.get(column);
    }

    public KylinModel(Map<String, String> query, JSONObject model, String serverIp, String username, String password) throws Exception {
        if (model == null) {
            throw new CBoardException("Model not found");
        }
        this.model = model;
        String t = ((JSONObject) model).getString("fact_table");
        model.getJSONArray("dimensions").forEach(e -> {
//                    String t = ((JSONObject) e).getString("table");
                    Map<String, String> types = getColumnsType(query, t, serverIp, username, password);
                    types.entrySet().forEach(et -> columnType.put(et.getKey(), et.getValue()));
                    ((JSONObject) e).getJSONArray("columns").stream().map(c -> c.toString()).forEach(s -> {
                                String alias = tableAlias.get(t);
                                if (alias == null) {
                                    alias = "_t" + tableAlias.keySet().size() + 1;
                                    tableAlias.put(t, alias);
                                }
                                columnTable.put(s, t);
                            }
                    );
                }
        );
        model.getJSONArray("metrics").stream().map(e -> e.toString()).forEach(s ->
                {
//                    String t = model.getString("fact_table");
                    String alias = tableAlias.get(t);
                    if (alias == null) {
                        alias = "_t" + tableAlias.keySet().size() + 1;
                        tableAlias.put(t, alias);
                    }
                    columnTable.put(s, t);
                }
        );
    }

    public String geModelSql() {
        String factTable = formatTableName(model.getString("fact_table"));
        if (tableAlias.get(factTable) == null) {
            return factTable;
        }
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

    public String[] getColumns() {
        List<String> result = new ArrayList<>();
        model.getJSONArray("dimensions").forEach(e ->
                        ((JSONObject) e).getJSONArray("columns").stream().map(c -> c.toString()).forEach(result::add)
        );
        model.getJSONArray("metrics").stream().map(e -> e.toString()).forEach(result::add);
        return result.toArray(new String[0]);
    }

    public String formatTableName(String rawName) {
        String tmp = rawName.replaceAll("\"", "");
        StringJoiner joiner = new StringJoiner(".");
        Arrays.stream(tmp.split("\\.")).map(i -> surroundWithQuta(i)).forEach(joiner::add);
        return joiner.toString();
    }

    private String surroundWithQuta(String text) {
        return QUOTATAION + text + QUOTATAION;
    }

}
