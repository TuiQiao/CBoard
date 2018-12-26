package org.cboard.cache;

/**
 * Created by yfyuan on 2016/11/7.
 */
public interface CacheManager<T> {

    void put(String key, T data, long expire);

    T get(String key);

    void remove(String key);
}
