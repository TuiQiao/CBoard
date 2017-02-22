package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.cboard.services.persist.PersistContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Created by yfyuan on 2017/2/10.
 */
@Service
public class PersistService {

    @Value("${phantomjs_path}")
    private String phantomjsPath;
    private String scriptPath = new File(this.getClass().getResource("/phantom.js").getFile()).getPath();

    private static final ConcurrentMap<String, PersistContext> TASK_MAP = new ConcurrentHashMap<>();

    public PersistContext persist(Long dashboardId, String userId) {
        String persistId = UUID.randomUUID().toString().replaceAll("-", "");
        try {
            Process process = Runtime.getRuntime().exec(String.format("%s %s %s %s %s", phantomjsPath, scriptPath, dashboardId, persistId, userId));
            TASK_MAP.put(persistId, new PersistContext(dashboardId));
            synchronized (persistId.intern()) {
                persistId.intern().wait(5 * 60 * 1000);
                persistId.intern().notify();
            }
            PersistContext result = TASK_MAP.get(persistId);
            TASK_MAP.remove(persistId);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public String persistCallback(String persistId, JSONObject data) {
        synchronized (persistId.intern()) {
            TASK_MAP.get(persistId).setData(data);
            persistId.intern().notify();
        }
        return "1";
    }
}
