package org.cboard.controller;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONPath;
import org.apache.commons.lang3.StringUtils;
import org.cboard.dao.DatasetDao;
import org.cboard.dao.WidgetDao;
import org.cboard.pojo.DashboardDataset;
import org.cboard.pojo.DashboardWidget;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;

/**
 * Created by yfyuan on 2017/5/17.
 */
@RestController
@RequestMapping("/update")
public class UpdateController extends BaseController {

    @Value("${admin_user_id}")
    private String adminUserId;

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private WidgetDao widgetDao;

    @RequestMapping(value = "/dataset")
    public String dataset() {
        String userId = tlUser.get().getUserId();
        if (!adminUserId.equals(userId)) {
            return "";
        }
        List<DashboardDataset> datasetList = datasetDao.getDatasetList(userId);

        Consumer<Object> addId = o -> {
            JSONObject _j = (JSONObject) o;
            if (!_j.containsKey("id")) {
                _j.put("id", UUID.randomUUID().toString());
            }
        };

        datasetList.forEach(dataset -> {
            JSONObject jsonObject = JSONObject.parseObject(dataset.getData());
            JSONObject schema = jsonObject.getJSONObject("schema");
            if (schema != null) {
                schema.getJSONArray("measure").forEach(addId);
                schema.getJSONArray("dimension").forEach(d -> {
                    addId.accept(d);
                    JSONObject _j = (JSONObject) d;
                    if ("level".equals(_j.getString("type"))) {
                        _j.getJSONArray("columns").forEach(addId);
                    }
                });
            }
            if (jsonObject.containsKey("filters")) {
                jsonObject.getJSONArray("filters").forEach(addId);
            }
            if (jsonObject.containsKey("expressions")) {
                jsonObject.getJSONArray("expressions").forEach(addId);
            }
            dataset.setData(jsonObject.toJSONString());
            datasetDao.update(dataset);
        });
        return "1";
    }

    @RequestMapping(value = "/widget")
    public String widget() {
        String userId = tlUser.get().getUserId();
        if (!adminUserId.equals(userId)) {
            return "";
        }
        List<DashboardWidget> widgetList = widgetDao.getWidgetList(userId);
        widgetList.forEach(widget -> {
            Long datasetId = JSONObject.parseObject(widget.getData()).getLong("datasetId");
            DashboardDataset dataset = datasetDao.getDataset(datasetId);
            if (dataset != null) {
                JSONObject _dataset = JSONObject.parseObject(dataset.getData());
                JSONObject data = JSONObject.parseObject(widget.getData());
                JSONObject config = data.getJSONObject("config");
                if (config.containsKey("keys")) {
                    config.getJSONArray("keys").forEach(k -> addDimensionId(_dataset, k));
                }
                if (config.containsKey("groups")) {
                    config.getJSONArray("groups").forEach(k -> addDimensionId(_dataset, k));
                }
                if (config.containsKey("values")) {
                    config.getJSONArray("values").forEach(v -> {
                        JSONObject _v = (JSONObject) v;
                        _v.getJSONArray("cols").forEach(c -> addExpressionId(_dataset, c));
                    });
                }
                if (config.containsKey("filters")) {
                    config.getJSONArray("filters").forEach(f -> addFilterGroupId(_dataset, f));
                }
                widget.setData(data.toJSONString());
                widgetDao.update(widget);
            }
        });

        return "1";
    }

    private void addFilterGroupId(JSONObject dataset, Object o) {
        JSONObject object = (JSONObject) o;
        if (!object.containsKey("group") || object.containsKey("id")) {
            return;
        }
        if (dataset.getJSONArray("filters") == null) {
            return;
        }
        String group = object.getString("group");
        String id = (String) JSONPath.eval(dataset, "$.filters[group='" + group + "'][0].id");
        if (id != null) {
            object.put("id", id);
        }
    }

    private void addExpressionId(JSONObject dataset, Object o) {
        JSONObject object = (JSONObject) o;
        if (!"exp".equals(object.getString("type")) || object.containsKey("id")) {
            return;
        }
        if (dataset.getJSONArray("expressions") == null) {
            return;
        }
        String alias = object.getString("alias");
        String id = (String) JSONPath.eval(dataset, "$.expressions[alias='" + alias + "'][type='exp'][0].id");
        if (id != null) {
            object.put("id", id);
        }
    }

    private void addDimensionId(JSONObject dataset, Object o) {
        JSONObject object = (JSONObject) o;
        if (object.containsKey("id")) {
            return;
        }
        if (!dataset.containsKey("schema")) {
            return;
        }
        String column = object.getString("col");
        String alias = object.getString("alias");

        String path = "$.dimension";
        if (StringUtils.isNotEmpty(alias)) {
            path += "[alias='" + alias + "']";
        }
        if (StringUtils.isNotEmpty(column)) {
            path += "[column='" + column + "']";
        }
        path += "[0].id";
        String id = (String) JSONPath.eval(dataset.getJSONObject("schema"), path);
        if (id == null) {
            path = "$.dimension[type='level'].columns";
            if (StringUtils.isNotEmpty(alias)) {
                path += "[alias='" + alias + "']";
            }
            if (StringUtils.isNotEmpty(column)) {
                path += "[column='" + column + "']";
            }
            path += "[0].id";
            id = (String) JSONPath.eval(dataset.getJSONObject("schema"), path);
        }
        if (id != null) {
            object.put("id", id);
        }
    }
}
