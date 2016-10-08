package org.cboard.services;

import org.cboard.dto.DataProviderResult;
import org.springframework.stereotype.Repository;

import javax.servlet.ServletRequestEvent;
import javax.servlet.ServletRequestListener;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by yfyuan on 2016/8/24.
 */
@Repository
public class CachedDataProviderService extends DataProviderService implements ServletRequestListener {

    private static ThreadLocal<Map<String, DataProviderResult>> cache = new ThreadLocal<>();

    @Override
    public DataProviderResult getData(Long datasourceId, Map<String, String> query) {
        Map<String, DataProviderResult> map = cache.get();

        String keys = "" + datasourceId + "_" + query.toString();

        DataProviderResult data = map.get(keys);
        if (data == null) {
            data = super.getData(datasourceId, query);
            map.put(keys, data);
        }
        return data;
    }

    @Override
    public void requestDestroyed(ServletRequestEvent servletRequestEvent) {
        cache.remove();
    }

    @Override
    public void requestInitialized(ServletRequestEvent servletRequestEvent) {
        cache.set(new HashMap<String, DataProviderResult>());
    }
}
