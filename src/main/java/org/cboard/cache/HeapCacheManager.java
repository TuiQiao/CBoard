package org.cboard.cache;

import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Created by yfyuan on 2016/11/7.
 */
public class HeapCacheManager<T> implements CacheManager<T> {

    private static ConcurrentMap<String, HeapCacheManager.CacheObject> cache = new ConcurrentHashMap<>();

    @Override
    public void put(String key, T data, long expire) {
        cache.put(key, new CacheObject(new Date().getTime(), expire, data));
    }

    @Override
    public T get(String key) {
        CacheObject o = cache.get(key);
        if (o == null || new Date().getTime() >= o.getT1() + o.getExpire())
            return null;
        else {
            return (T) o.getD();
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
