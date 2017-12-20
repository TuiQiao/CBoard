package org.cboard.kylin.model;

import com.alibaba.fastjson.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by zyong on 2017/4/11.
 *     columns: Array[column]
 *     tableAlias: Map<db.table, _tnn>
 *     columnTable: Map<column, db.table>
 *     columnType: Map<column, dataType>
 */
public class KylinModel1x extends KylinBaseModel {

    public KylinModel1x(JSONObject model, Map<String, String> dataSource, Map<String, String> query, String[] version) throws Exception {
        super(model, dataSource, query, version);
    }

    @Override
    void initMetaData() throws Exception {
        String factTable = model.getString("fact_table");
        tableAlias.put(factTable, "fact");
        model.getJSONArray("dimensions").forEach(e -> {
            JSONObject dims = (JSONObject) e;
            String t = dims.getString("table");
            Map<String, String> types = initColumnsDataType(t);
            types.entrySet().forEach(et -> columnType.put(et.getKey(), et.getValue()));
            dims.getJSONArray("columns").stream()
                    .map(c -> c.toString())
                    .forEach(s -> {
                        String alias = tableAlias.get(t);
                        if (alias == null) {
                            alias = "_t" + tableAlias.keySet().size() + 1;
                            tableAlias.put(t, alias);
                        }
                        columnTable.put(s, t);
                    });
        });
        model.getJSONArray("metrics").stream()
                .forEach(metric -> columnTable.put(metric.toString(), factTable));
    }

    /**
     * Return Array[column]
     */
    @Override
    public String[] getColumns() {
        List<String> result = new ArrayList<>();
        model.getJSONArray("dimensions").forEach(e ->
                ((JSONObject) e).getJSONArray("columns").stream().map(c -> c.toString()).forEach(result::add)
        );
        model.getJSONArray("metrics").stream().map(e -> e.toString()).forEach(result::add);
        return result.toArray(new String[0]);
    }
}