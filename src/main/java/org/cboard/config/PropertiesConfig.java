package org.cboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;

/**
 * @author WangKun
 * @create 2018-07-31
 * @desc
 **/
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

    public String getLogout() {
        return logout;
    }

    public void setLogout(String logout) {
        this.logout = logout;
    }

    public String getCheck() {
        return check;
    }

    public void setCheck(String check) {
        this.check = check;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getValidationQuery() {
        return validationQuery;
    }

    public void setValidationQuery(String validationQuery) {
        this.validationQuery = validationQuery;
    }

    public String getJdbcUsername() {
        return jdbcUsername;
    }

    public void setJdbcUsername(String jdbcUsername) {
        this.jdbcUsername = jdbcUsername;
    }

    public String getJdbcPassword() {
        return jdbcPassword;
    }

    public void setJdbcPassword(String jdbcPassword) {
        this.jdbcPassword = jdbcPassword;
    }

    public String getJdbcUrl() {
        return jdbcUrl;
    }

    public void setJdbcUrl(String jdbcUrl) {
        this.jdbcUrl = jdbcUrl;
    }

    public String getH2Url() {
        return h2Url;
    }

    public void setH2Url(String h2Url) {
        this.h2Url = h2Url;
    }

    public String getH2UserName() {
        return h2UserName;
    }

    public void setH2UserName(String h2UserName) {
        this.h2UserName = h2UserName;
    }

    public String getH2DatabaseName() {
        return h2DatabaseName;
    }

    public void setH2DatabaseName(String h2DatabaseName) {
        this.h2DatabaseName = h2DatabaseName;
    }

    public String getH2Quarz() {
        return h2Quarz;
    }

    public void setH2Quarz(String h2Quarz) {
        this.h2Quarz = h2Quarz;
    }

    public String getRedisHostName() {
        return redisHostName;
    }

    public void setRedisHostName(String redisHostName) {
        this.redisHostName = redisHostName;
    }

    public int getRedisPort() {
        return redisPort;
    }

    public void setRedisPort(int redisPort) {
        this.redisPort = redisPort;
    }
}
