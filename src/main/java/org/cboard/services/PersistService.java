package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.BiFunction;

/**
 * Created by yfyuan on 2017/2/10.
 */
@Service
public class PersistService {

    @Value("${phantomjs_path}")
    private String phantomjsPath;
    private String scriptPath = new File(this.getClass().getResource("/phantom.js").getFile()).getPath();

    private static final ConcurrentMap<String, PersistContext> TASK_MAP = new ConcurrentHashMap<>();

    public String persist(Long dashboardId, BiFunction<Long, JSONObject, String> callback) {
        String persistId = UUID.randomUUID().toString().replaceAll("-", "");
        try {
            Process process = Runtime.getRuntime().exec(String.format("%s %s %s %s", phantomjsPath, scriptPath, dashboardId, persistId));
            TASK_MAP.put(persistId, new PersistContext(dashboardId, callback));
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public String persistCallback(String persistId, JSONObject data) {
        new Thread(() -> {
            PersistContext context = TASK_MAP.get(persistId);
            context.getCallback().apply(context.getDashboardId(), data);
        }, "Persist_" + persistId).start();
        return "1";
    }

    private class PersistContext {
        private Long dashboardId;
        private BiFunction<Long, JSONObject, String> callback;

        public PersistContext(Long dashboardId, BiFunction<Long, JSONObject, String> callback) {
            this.dashboardId = dashboardId;
            this.callback = callback;
        }

        public Long getDashboardId() {
            return dashboardId;
        }

        public void setDashboardId(Long dashboardId) {
            this.dashboardId = dashboardId;
        }

        public BiFunction<Long, JSONObject, String> getCallback() {
            return callback;
        }

        public void setCallback(BiFunction<Long, JSONObject, String> callback) {
            this.callback = callback;
        }
    }
}
