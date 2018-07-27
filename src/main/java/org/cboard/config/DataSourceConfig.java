package org.cboard.config;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.support.spring.stat.DruidStatInterceptor;
import org.apache.commons.dbcp2.BasicDataSource;
import org.cboard.cache.RedisCacheManager;
import org.h2.Driver;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.Advisor;
import org.springframework.aop.support.DefaultPointcutAdvisor;
import org.springframework.aop.support.JdkRegexpMethodPointcut;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.io.IOException;
import java.sql.SQLException;

/**
 * @author WangKun
 * @create 2018-07-25
 * @desc
 **/
@Configuration
@PropertySource(value = {"classpath:config.properties", "classpath:caso.properties"}, encoding = "UTF-8")
@MapperScan("org.cboard.dao")
@EnableTransactionManagement
public class DataSourceConfig {
    private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${validationQuery}")
    private String validationQuery;

    @Value("${jdbc_username}")
    private String jdbcUsername;

    @Value("${jdbc_password}")
    private String jdbcPassword;

    @Value("${jdbc_url}")
    private String jdbcUrl;

    @Value("${aggregator.h2.url}")
    private String h2Url;

    @Value("${aggregator.h2.user.name}")
    private String h2UserName;

    @Value("${aggregator.h2.database.name}")
    private String h2DatabaseName;

    @Value("${aggregator.h2.cleanjob.quarz}")
    private String h2Quarz;

    @Value("${cache.redis.hostName}")
    private String redisHostName;

    @Value("${cache.redis.port}")
    private int redisPort;

//    @Bean(name = "rawDataCache")
//    public EhCacheManager ehCacheManager() {
//        EhCacheManager ehCacheManager = new EhCacheManager();
//        ehCacheManager.setCacheAlias("jvmAggregator");
//        return ehCacheManager;
//    }

    @Bean(name = "rawDataCache")
    public RedisCacheManager redisCacheManager() {
        RedisCacheManager redisCacheManager = new RedisCacheManager();
        JedisConnectionFactory jedisConnectionFactory = new JedisConnectionFactory();
        jedisConnectionFactory.setHostName(redisHostName);
        jedisConnectionFactory.setPort(redisPort);
        jedisConnectionFactory.setUsePool(true);

        RedisTemplate redisTemplate = new RedisTemplate();
        redisTemplate.setConnectionFactory(jedisConnectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisCacheManager.setRedisTemplate(redisTemplate);
        return redisCacheManager;
    }

    @Bean(name = "h2DataSource")
    public BasicDataSource basicDataSource() {
        LOGGER.info("basicDataSource init go");
        BasicDataSource basicDataSource = new BasicDataSource();
        Driver driver = new org.h2.Driver();
        basicDataSource.setDriver(driver);
        basicDataSource.setUrl(h2Url);
        basicDataSource.setUsername(h2UserName);
        basicDataSource.setPassword("");
        basicDataSource.setMaxTotal(20);
        LOGGER.info("basicDataSource init ok");
        return basicDataSource;
    }

    @Bean(name = "druidDataSource")
    public DruidDataSource druidDataSource() {
        DruidDataSource ds = new DruidDataSource();
        LOGGER.info("dataSourceConfig init go");
        ds.setName("CBoard Meta Data");
        ds.setUrl(jdbcUrl);
        ds.setUsername(jdbcUsername);
        ds.setPassword(jdbcPassword);
        ds.setInitialSize(0);
        ds.setMaxActive(20);
        ds.setMinIdle(0);
        ds.setMaxWait(60000);
        ds.setValidationQuery(validationQuery);
        ds.setTestOnBorrow(false);
        ds.setTestOnReturn(false);
        ds.setTestWhileIdle(true);
        ds.setTimeBetweenEvictionRunsMillis(60000);
        ds.setMinEvictableIdleTimeMillis(25200000);
        ds.setRemoveAbandoned(true);
        ds.setRemoveAbandonedTimeout(1800);
        ds.setLogAbandoned(true);
        try {
            ds.setFilters("mergeStat,log4j");
        } catch (SQLException e) {
            LOGGER.error("dataSourceConfig init error", e);
        }
        LOGGER.info("dataSourceConfig init ok");
        return ds;
    }

    @Bean(name = "sqlSessionFactory")
    public SqlSessionFactoryBean sqlSessionFactoryBean() {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(druidDataSource());
        try {
            sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*.xml"));
        } catch (IOException e) {
            LOGGER.error("sqlSessionFactoryBean setMapperLocations is error", e);
        }
        return sqlSessionFactoryBean;
    }

    @Bean(name = "transactionManager")
    public DataSourceTransactionManager dataSourceTransactionManager() {
        DataSourceTransactionManager dataSourceTransactionManager = new DataSourceTransactionManager();
        dataSourceTransactionManager.setDataSource(druidDataSource());
        return dataSourceTransactionManager;
    }

    @Bean(name = "druid-stat-interceptor")
    public DruidStatInterceptor druidStatInterceptor() {
        return new DruidStatInterceptor();
    }

    @Bean(name = "druid-stat-pointcut")
    public JdkRegexpMethodPointcut jdkRegexpMethodPointcut() {
        JdkRegexpMethodPointcut jdkRegexpMethodPointcut = new JdkRegexpMethodPointcut();
        jdkRegexpMethodPointcut.setPattern("org.cboard.dao.*");
        return jdkRegexpMethodPointcut;
    }

    @Bean
    public Advisor druidStatAdvisor() {
        return new DefaultPointcutAdvisor(jdkRegexpMethodPointcut(), druidStatInterceptor());
    }
}
