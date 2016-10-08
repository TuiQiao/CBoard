package org.cboard.services;

import org.cboard.dto.DataProviderResult;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by yfyuan on 2016/8/24.
 */
@Repository
public class CachedDataProviderService extends DataProviderService {

    private static ThreadLocal<Map<String, DataProviderResult>> cache = new ThreadLocal<>();

    @Override
    public DataProviderResult getData(Long datasourceId, Map<String, String> query) {
        Map<String, DataProviderResult> map = cache.get();
        if (map == null) {
            cache.set(new HashMap<String, DataProviderResult>());
            map = cache.get();
        }

        String keys = "" + datasourceId + "_" + query.toString();

        DataProviderResult data = map.get(keys);
        if (data == null) {
            data = super.getData(datasourceId, query);
            map.put(keys, data);
        }
        return data;
    }
}
