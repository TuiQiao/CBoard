package org.cboard.jdbc;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * JDBC URL安全检查工具类：拦截恶意参数和注入逻辑
 */
public class JdbcSecurityChecker {
    private static final Logger LOG = LoggerFactory.getLogger(JdbcSecurityChecker.class);

    // -------------------------- 基础校验配置 --------------------------
    // 1. 支持的JDBC协议白名单（仅允许以下协议，防止协议伪装）
    private static final Set<String> ALLOWED_JDBC_PROTOCOLS = new HashSet<>(Arrays.asList(
            "jdbc:mysql:",
            "jdbc:oracle:",
            "jdbc:h2:",
            "jdbc:postgresql:",
            "jdbc:sqlserver:",
            "jdbc:sqlite:"
    ));

    // 2. 高危关键字黑名单（拦截恶意操作，忽略大小写）
    private static final Set<String> DANGER_KEYWORDS = new HashSet<>(Arrays.asList(
            // 系统命令执行相关
            "Runtime.getRuntime().exec", "exec\\(", "cmd_exec",
            // 高危SQL操作
            "CREATE ALIAS", "CREATE FUNCTION", "DROP ALIAS", "DROP FUNCTION",
            "CALL ", "EXEC ", "EXECUTE ", "ALTER ", "DROP ", "TRUNCATE ",
            "INSERT ", "UPDATE ", "DELETE ", "MERGE ",
            // 不安全配置参数
            "ALLOW_UNKNOWN_CLIENTS", "ALLOW_EMPTY_PASSWORD", "TRUST_ALL_CERTS",
            "TRACE_LEVEL_SYSTEM_OUT=3", "TRACE_LEVEL_SYSTEM_OUT=4" // 高等级日志可能泄露信息
    ));

    // 3. 高危参数名黑名单（拦截危险配置项）
    private static final Set<String> DANGER_PARAM_NAMES = new HashSet<>(Arrays.asList(
            "INIT", "INIT_SQL", "EXEC_SQL", "COMMAND", "CMD"
    ));

    // 4. 正则表达式：匹配URL中的恶意代码片段（如分号分隔的注入逻辑）
    private static final Pattern DANGER_PATTERN = Pattern.compile(
            // 匹配 ;xxx=...; 中包含高危操作的片段，或直接执行SQL的逻辑
            "\\;(\\s*|.)*(CREATE ALIAS|EXEC\\(|CALL |DROP |TRUNCATE|INSERT|UPDATE|DELETE)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // -------------------------- 安全检查方法 --------------------------
    /**
     * 对JDBC URL进行全面安全检查
     *
     * @param jdbcUrl 待检查的JDBC URL
     * @throws IllegalArgumentException 非法URL时抛出异常
     */
    public static void checkJdbcUrlSafety(String jdbcUrl) {
        if (StringUtils.isBlank(jdbcUrl)) {
            throw new IllegalArgumentException("JDBC URL不能为空");
        }

        // 1. 协议白名单校验（必须是允许的JDBC协议）
        // checkProtocol(jdbcUrl);

        // 2. 高危关键字过滤（拦截恶意操作片段）
        checkDangerKeywords(jdbcUrl);

        // 3. 高危参数名过滤（拦截危险配置项）
        checkDangerParams(jdbcUrl);

        // 4. 恶意注入逻辑正则校验（补充黑名单遗漏场景）
        checkDangerPattern(jdbcUrl);

        LOG.info("JDBC URL安全检查通过：{}", maskSensitiveUrl(jdbcUrl));
    }

    /**
     * 1. 协议白名单校验：仅允许指定的JDBC协议
     */
    private static void checkProtocol(String jdbcUrl) {
        boolean isAllowed = ALLOWED_JDBC_PROTOCOLS.stream()
                .anyMatch(protocol -> jdbcUrl.startsWith(protocol));
        if (!isAllowed) {
            throw new IllegalArgumentException("非法JDBC协议！仅支持：" + String.join(", ", ALLOWED_JDBC_PROTOCOLS));
        }
    }

    /**
     * 2. 高危关键字过滤：包含黑名单关键字则拒绝
     */
    private static void checkDangerKeywords(String jdbcUrl) {
        String lowerUrl = jdbcUrl.toLowerCase();
        for (String keyword : DANGER_KEYWORDS) {
            if (lowerUrl.contains(keyword.toLowerCase())) {
                throw new IllegalArgumentException("JDBC URL包含非法关键字：" + keyword);
            }
        }
    }

    /**
     * 3. 高危参数名过滤：禁止包含危险参数（如INIT）
     */
    private static void checkDangerParams(String jdbcUrl) {
        // 分割URL中的参数部分（; 分隔参数，? 分隔URL和查询参数）
        String[] urlParts = jdbcUrl.split("[;?]");
        for (String part : urlParts) {
            if (StringUtils.isBlank(part)) {
                continue;
            }
            // 提取参数名（等号前的部分）
            String paramName = part.split("=", 2)[0].trim();
            if (DANGER_PARAM_NAMES.stream().anyMatch(name -> name.equalsIgnoreCase(paramName))) {
                throw new IllegalArgumentException("JDBC URL包含非法参数名：" + paramName);
            }
        }
    }

    /**
     * 4. 恶意注入逻辑正则校验：拦截分号分隔的注入代码
     */
    private static void checkDangerPattern(String jdbcUrl) {
        if (DANGER_PATTERN.matcher(jdbcUrl).find()) {
            throw new IllegalArgumentException("JDBC URL包含恶意注入逻辑");
        }
    }

    /**
     * 辅助方法：URL脱敏（日志中隐藏账号密码等敏感信息）
     */
    public static String maskSensitiveUrl(String jdbcUrl) {
        if (StringUtils.isBlank(jdbcUrl)) {
            return "";
        }
        // 脱敏账号、密码、密钥等参数
        return jdbcUrl.replaceAll("user=[^&;]+", "user=***")
                .replaceAll("username=[^&;]+", "username=***")
                .replaceAll("password=[^&;]+", "password=***")
                .replaceAll("pwd=[^&;]+", "pwd=***")
                .replaceAll("key=[^&;]+", "key=***");
    }
}
