package org.cboard.kylin.kylin2x;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang.StringUtils;
import org.cboard.exception.CBoardException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthorizationInterceptor;
import org.springframework.web.client.RestTemplate;

import com.alibaba.fastjson.JSONObject;

class KylinModel implements Serializable {
	private static final long serialVersionUID = -6827606497416189044L;
	private JSONObject model;
	private Map<String, String> columnTable = new HashMap<String, String>();
	private Map<String, String> tableAlias = new HashMap<String, String>();
	private Map<String, String> columnType = new HashMap<String, String>();

	public String getTable(String column) {
		return columnTable.get(column);
	}
	
	private Map<String, String> getColumnsType(String table, String serverIp, String username, String password) {
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.getInterceptors().add(new BasicAuthorizationInterceptor(username, password));
		ResponseEntity<String> a = restTemplate.getForEntity("http://" + serverIp + "/kylin/api/tables/{tableName}",
				String.class, table);
		JSONObject jsonObject = JSONObject.parseObject(a.getBody());
		Map<String, String> result = new HashMap<String, String>();
		jsonObject.getJSONArray("columns").stream().map(e -> (JSONObject) e)
				.forEach(e -> result.put(e.getString("name"), e.getString("datatype")));
		return result;
	}

	public String getColumnType(String column) {
		return columnType.get(column);
	}

	public KylinModel(JSONObject model, String serverIp, String username, String password) throws Exception {
		if (model == null) {
			throw new CBoardException("Model not found");
		}
		this.model = model;
		Map<String, String> tableMap = new HashMap<String, String>();

		String factTable = model.getString("fact_table");
		tableMap.put(StringUtils.substringAfter(factTable, "."), factTable);

		model.getJSONArray("lookups").stream().map(e -> (JSONObject) e)
				.forEach(s -> tableMap.put(s.getString("alias"), s.getString("table")));

		model.getJSONArray("dimensions").forEach(e -> {
			String talis = ((JSONObject) e).getString("table");
			String t = tableMap.get(talis);
			Map<String, String> types = getColumnsType(t, serverIp, username, password);
			types.entrySet().forEach(et -> columnType.put(talis + "." + et.getKey(), et.getValue()));
			String table = ((JSONObject) e).getString("table");
			((JSONObject) e).getJSONArray("columns").stream().map(c -> c.toString())
					.forEach(s -> columnTable.put(table + "." + s, t));
		});
		model.getJSONArray("metrics").stream().map(e -> e.toString()).forEach(s -> columnTable.put(s, factTable));
	}

	public String geModelSql() {
		String factTable = model.getString("fact_table");
		return String.format("%s %s %s", factTable, StringUtils.substringAfter(model.getString("fact_table"), "."),
				getJoinSql(tableAlias.get(factTable)));
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

	public String[] getColumns() {
		List<String> result = new ArrayList<>();
		model.getJSONArray("dimensions").stream().map(e -> (JSONObject) e).forEach(s -> s.getJSONArray("columns")
				.stream().map(e -> (String) e).forEach(r -> result.add(s.getString("table") + "." + r)));
		model.getJSONArray("metrics").stream().map(e -> e.toString()).forEach(result::add);
		return result.toArray(new String[0]);
	}
	
}
