package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.cboard.dao.BoardDao;
import org.cboard.exception.CBoardException;
import org.cboard.pojo.DashboardBoard;
import org.cboard.security.service.LocalSecurityFilter;
import org.cboard.services.persist.PersistContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.net.URLDecoder;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Created by yfyuan on 2017/2/10.
 */
@Service
public class PersistService {

    private static final Logger LOG = LoggerFactory.getLogger(PersistService.class);

    @Value("${phantomjs_path}")
    private String phantomjsPath;
    @Autowired
    private BoardDao boardDao;
    private String scriptPath = new File(this.getClass().getResource("/phantom.js").getFile()).getPath();

    private static final ConcurrentMap<String, PersistContext> TASK_MAP = new ConcurrentHashMap<>();

    public PersistContext persist(Long dashboardId, String userId) {
        String persistId = UUID.randomUUID().toString().replaceAll("-", "");
        Process process = null;
        try {
            if (boardDao.getBoard(dashboardId) == null) {
                throw new CBoardException(String.format("Dashbaord ID [%s] doesn't exist!", dashboardId));
            }
            PersistContext context = new PersistContext(dashboardId);
            TASK_MAP.put(persistId, context);
            String uuid = UUID.randomUUID().toString().replaceAll("-", "");
            LocalSecurityFilter.put(uuid, userId);
            String phantomUrl = new StringBuffer(LocalSecurityFilter.getSchema())
                    .append("://127.0.0.1:")
                    .append(LocalSecurityFilter.getContext())
                    .append("/render.html")
                    .append("?sid=").append(uuid)
                    .append("#?id=").append(dashboardId)
                    .append("&pid=").append(persistId)
                    .toString();
            scriptPath = URLDecoder.decode(scriptPath, "UTF-8"); // decode whitespace
            String cmd = String.format("%s %s %s", phantomjsPath, scriptPath, phantomUrl);
            LOG.info("Run phantomjs command: {}", cmd);
            process = Runtime.getRuntime().exec(cmd);
            final Process p = process;
            new Thread(() -> {
                InputStreamReader ir = new InputStreamReader(p.getInputStream());
                LineNumberReader input = new LineNumberReader(ir);
                String line;
                try {
                    while ((line = input.readLine()) != null) {
                        LOG.info(line);
                    }
                    LOG.info("Finished command " + cmd);
                } catch (Exception e) {
                    LOG.error("Error", e);
                    p.destroy();
                }
            }).start();
            synchronized (context) {
                context.wait(10 * 60 * 1000);
            }
            process.destroy();
            TASK_MAP.remove(persistId);
            return context;
        } catch (Exception e) {
            if (process != null) {
                process.destroy();
            }
            LOG.error(getClass().getName(), e);
            throw new CBoardException(e.getMessage());
        }
    }

    public String persistCallback(String persistId, JSONObject data) {
        PersistContext context = TASK_MAP.get(persistId);
        synchronized (context) {
            context.setData(data);
            context.notify();
        }
        return "1";
    }
}
