package org.cboard.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;

/**
 * @author WangKun
 * @create 2018-07-31
 * @desc
 **/
@Data
@PropertySource(value = {"classpath:config.properties", "classpath:caso.properties"}, encoding = "UTF-8")
public class PropertiesConfig {

    @Value("${caso.server.logout}")
    private String logout;

    @Value("${caso.client.check}")
    private String check;

    @Value("${caso.server.url}")
    private String url;

    @Value("${caso.server.login}")
    private String login;

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
}
