package org.cboard.config;

import org.cboard.cache.EhCacheManager;
import org.cboard.cache.RedisCacheManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * @author WangKun
 * @create 2018-07-30
 * @desc
 **/
@EnableCaching
public class CacheConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(CacheConfig.class);

    @Autowired
    private RedisTemplate redisTemplate;

    @Bean(name = "rawDataCache")
    public EhCacheManager ehCacheManager() {
        EhCacheManager ehCacheManager = new EhCacheManager();
        ehCacheManager.setCacheAlias("jvmAggregator");
        LOGGER.info("ehCacheManager init ok");
        return ehCacheManager;
    }


//    @Bean(name = "rawDataCache")
    public RedisCacheManager redisCacheManager() {
        RedisCacheManager redisCacheManager = new RedisCacheManager();
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisCacheManager.setRedisTemplate(redisTemplate);
        LOGGER.info("redisCacheManager init ok");
        return redisCacheManager;
    }
}
