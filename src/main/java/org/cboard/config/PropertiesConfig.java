package org.cboard.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @author WangKun
 * @create 2018-07-31
 * @desc
 **/
@Data
public class PropertiesConfig {

    @Value("${cas.server.logout}")
    private String logout;

    @Value("${cas.client.check}")
    private String check;

    @Value("${cas.server.url}")
    private String url;

    @Value("${cas.server.login}")
    private String login;

    @Value("${spring.datasource.druidDataSource.validationQuery}")
    private String validationQuery;

    @Value("${spring.datasource.druidDataSource.username}")
    private String jdbcUsername;

    @Value("${spring.datasource.druidDataSource.password}")
    private String jdbcPassword;

    @Value("${spring.datasource.druidDataSource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.h2.url}")
    private String h2Url;

    @Value("${spring.datasource.h2.user.name}")
    private String h2UserName;

    @Value("${spring.datasource.h2.database.name}")
    private String h2DatabaseName;

    @Value("${spring.datasource.h2.cleanjob.quarz}")
    private String h2Quarz;

}
