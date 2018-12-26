package org.cboard.cache;

import org.springframework.data.redis.core.RedisTemplate;

import java.util.concurrent.TimeUnit;

/**
 * Created by yfyuan on 2016/11/7.
 */
public class RedisCacheManager<T> implements CacheManager<T> {

    private RedisTemplate<String, T> redisTemplate;

    @Override
    public void put(String key, T data, long expire) {
        redisTemplate.boundValueOps(key).set(data, expire, TimeUnit.MILLISECONDS);
    }

    @Override
    public T get(String key) {
        return redisTemplate.boundValueOps(key).get();
    }

    @Override
    public void remove(String key) {
        redisTemplate.delete(key);
    }

    public void setRedisTemplate(RedisTemplate<String, T> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
}
