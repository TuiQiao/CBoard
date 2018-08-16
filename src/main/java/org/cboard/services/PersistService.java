package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.cboard.dao.BoardDao;
import org.cboard.exception.CBoardException;
import org.cboard.security.service.LocalSecurityFilter;
import org.cboard.services.persist.PersistContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.net.URLDecoder;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

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
    private String scriptPath = System.getProperty("user.dir") + File.separator + "src/main/resources/static/phantom.js";

    private static int POOL_SIZE = 2;
    private static int cpuNums = Runtime.getRuntime().availableProcessors();
    private ExecutorService exePool = Executors.newFixedThreadPool(cpuNums * POOL_SIZE);

    private static final ConcurrentMap<String, PersistContext> TASK_MAP = new ConcurrentHashMap<>();

    public PersistContext persist(Long dashboardId, String userId) {

//        final CountDownLatch cdl = new CountDownLatch(1);
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
                    .append("/render")
                    .append("?sid=").append(uuid)
                    .append("#?id=").append(dashboardId)
                    .append("&pid=").append(persistId)
                    .toString();
            scriptPath = URLDecoder.decode(scriptPath, "UTF-8"); // decode whitespace

            List cmd = Arrays.asList(phantomjsPath, scriptPath, phantomUrl);
            LOG.info("Run phantomjs command: {}", cmd);
            ProcessBuilder builder = new ProcessBuilder(cmd);
            builder.redirectErrorStream(true);
            process = builder.start();
            final Process p = process;

            exePool.execute(new Thread(() -> {
                InputStreamReader ir = new InputStreamReader(p.getInputStream());
                LineNumberReader input = new LineNumberReader(ir);
                String line;
                try {
                    while (null != (line = input.readLine())) {
                        LOG.info(line);
                    }
                    int rs = p.waitFor();
//                    cdl.countDown();
                    LOG.info("Finished command = {}, waitForResult = {}", cmd, rs);
                } catch (Exception e) {
                    LOG.error("Error", e);
                } finally {
                    p.destroy();
                    try {
                        ir.close();
                        input.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                }
            }));
            synchronized (context) {
                context.wait(10 * 60 * 1000);
            }
//            cdl.await(10, TimeUnit.SECONDS);
            TASK_MAP.remove(persistId);
            return context;
        } catch (Exception e) {
            LOG.error(getClass().getName(), e);
            throw new CBoardException(e.getMessage());
        } finally {
            if (process != null) {
                process.destroy();
            }
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
