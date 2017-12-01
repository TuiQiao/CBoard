package org.cboard.kylin.model;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.lang.StringUtils;
import org.cboard.exception.CBoardException;
import org.cboard.kylin.TableMap;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthorizationInterceptor;
import org.springframework.web.client.RestTemplate;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by zyong on 2017/12/01.
 *     columns: Array[alias.column]
 *     tableAlias: Map<db.table, alias>, use alias in lookup meta info defined in kylin model XML
 *     columnTable: Map<alias.column, db.table>
 *     columnType: Map<alias.column, dataType>
 */
public class KylinModel2x extends KylinBaseModel {

    public KylinModel2x(JSONObject model, String serverIp, String username, String password) throws Exception {
        super(model, serverIp, username, password);
    }

    /**
     * Reuren alias."column"
     * @param column
     * @return
     */
    @Override
    public String getColumnWithAliasPrefix(String column) {
        return tableAlias.get(column) + "." + surroundWithQuta(column);
    }

    /**
     * Return Array[alias.column]
     * @return
     */
    @Override
    public String[] getColumns() {
        List<String> result = new ArrayList<>();
        model.getJSONArray("dimensions").stream().map(e -> (JSONObject) e)
                .forEach(dims -> dims.getJSONArray("columns").stream()
                        .map(col -> (String) col)
                        .forEach(col -> {
                            String tblAlias = dims.getString("table");
                            result.add(tblAlias + "." + col);
                        }));
        model.getJSONArray("metrics").stream().map(e -> e.toString()).forEach(result::add);
        return result.toArray(new String[0]);
    }

    @Override
    void initMetaData() throws Exception {
        String factTable = model.getString("fact_table");
        tableAlias.put(factTable, StringUtils.substringAfter(factTable, "."));

        model.getJSONArray("lookups").stream().map(e -> (JSONObject) e)
                .forEach(s -> tableAlias.put(s.getString("table"), s.getString("alias")));

        model.getJSONArray("dimensions").forEach(e -> {
            JSONObject dims = (JSONObject) e;
            String tblAlias = dims.getString("table");
            String tbl = tableAlias.get(tblAlias);
            Map<String, String> types = initColumnsDataType(tbl);
            types.entrySet().forEach(entry -> columnType.put(tblAlias + "."  + entry.getKey(), entry.getValue()));
            dims.getJSONArray("columns").stream()
                    .map(c -> c.toString())
                    .forEach(column -> columnTable.put(tblAlias + "." + column, tbl));
        });
        model.getJSONArray("metrics").stream()
                .forEach(metric -> columnTable.put(metric.toString(), factTable));
    }

    public String geModelSql() {
        String factTable = formatTableName(model.getString("fact_table"));
        return String.format("%s %s", getTableWithAliasSuffix(factTable), getJoinSql(tableAlias.get(factTable)));
    }

    private String getJoinSql(String factAlias) {
        String s = model.getJSONArray("lookups").stream().map(e -> {
            JSONObject j = (JSONObject) e;
            String[] pk = j.getJSONObject("join").getJSONArray("primary_key").stream().map(p -> p.toString()).toArray(String[]::new);
            String[] fk = j.getJSONObject("join").getJSONArray("foreign_key").stream().map(p -> p.toString()).toArray(String[]::new);
            List<String> on = new ArrayList<>();
            for (int i = 0; i < pk.length; i++) {
                on.add(String.format("%s = %s", pk[i], fk[i]));
            }
            String type = j.getJSONObject("join").getString("type").toUpperCase();
            String pTable = j.getString("table");
            String onStr = on.stream().collect(Collectors.joining(" and "));
            return String.format("\n %s JOIN %s %s ON %s", type, pTable, j.getString("alias"), onStr);
        }).collect(Collectors.joining(" "));
        return s;
    }

}
