package org.cboard.services;

import org.cboard.dto.DataProviderResult;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Created by yfyuan on 2016/8/24.
 */
@Repository
public class CachedDataProviderService extends DataProviderService {

    private static ConcurrentMap<String, CacheObject> cache = new ConcurrentHashMap<>();

    public DataProviderResult getData(Long datasourceId, Map<String, String> query, Long datasetId, boolean reload) {
        String keys = null;
        if (datasetId != null) {
            keys = "dataset_" + datasetId.toString();
        } else {
            keys = "" + datasourceId + "_" + query.toString();
        }

        CacheObject o = cache.get(keys);
        if (o == null || new Date().getTime() >= o.getT1() + o.getExpire() || reload) {
            synchronized (keys) {
                CacheObject oo = cache.get(keys);
                if (oo == null || new Date().getTime() >= oo.getT1() + oo.getExpire() || reload) {
                    DataProviderResult d = super.getData(datasourceId, query, datasetId);
                    long expire = 12 * 60 * 60 * 1000;
                    if (datasetId != null) {
                        Dataset dataset = super.getDataset(datasetId);
                        if (dataset.getInterval() != null && dataset.getInterval() > 0) {
                            expire = dataset.getInterval() * 1000;
                        }
                    }
                    cache.put(keys, new CacheObject(new Date().getTime(), expire, d));
                    return d;
                } else {
                    return (DataProviderResult) oo.getD();
                }
            }
        } else {
            return (DataProviderResult) o.getD();
        }
    }

    class CacheObject {
        private long t1;
        private long expire;
        private Object d;

        public CacheObject(long t1, long expire, Object d) {
            this.t1 = t1;
            this.expire = expire;
            this.d = d;
        }

        public long getT1() {
            return t1;
        }

        public void setT1(long t1) {
            this.t1 = t1;
        }

        public long getExpire() {
            return expire;
        }

        public void setExpire(long expire) {
            this.expire = expire;
        }

        public Object getD() {
            return d;
        }

        public void setD(Object d) {
            this.d = d;
        }
    }
}
