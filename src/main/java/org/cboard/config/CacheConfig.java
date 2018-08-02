package org.cboard.config;

import org.cboard.cache.EhCacheManager;
import org.cboard.cache.RedisCacheManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * @author WangKun
 * @create 2018-07-30
 * @desc
 **/
@Import(PropertiesConfig.class)
public class CacheConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(CacheConfig.class);

    @Autowired
    private PropertiesConfig propertiesConfig;

    @Bean(name = "rawDataCache")
    public EhCacheManager ehCacheManager() {
        EhCacheManager ehCacheManager = new EhCacheManager();
        ehCacheManager.setCacheAlias("jvmAggregator");
        return ehCacheManager;
    }

//    @Bean(name = "rawDataCache")
    public RedisCacheManager redisCacheManager() {
        LOGGER.info("redisCacheManager init go");
        RedisCacheManager redisCacheManager = new RedisCacheManager();
        JedisConnectionFactory jedisConnectionFactory = new JedisConnectionFactory();
        jedisConnectionFactory.setHostName(propertiesConfig.getRedisHostName());
        jedisConnectionFactory.setPort(propertiesConfig.getRedisPort());
        jedisConnectionFactory.setUsePool(true);

        RedisTemplate redisTemplate = new RedisTemplate();
        redisTemplate.setConnectionFactory(jedisConnectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisCacheManager.setRedisTemplate(redisTemplate);
        return redisCacheManager;
    }
}
