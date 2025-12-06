package org.cboard.util.sql;

import org.apache.commons.lang3.StringUtils;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * SQL注入防护字符串验证工具类（升级：支持配置是否抛出异常）
 */
public class SqlInjectionValidator {
    // -------------------------- 默认配置 --------------------------
    /** 高危SQL关键字黑名单（忽略大小写）- 覆盖常见注入操作 */
    private static final Set<String> DEFAULT_DANGER_KEYWORDS = new HashSet<>();
    /** 高危符号黑名单（支持单字符/多字符）- 避免拼接时破坏SQL语法 */
    private static final Set<String> DEFAULT_DANGER_CHARS = new HashSet<>();
    /** 注入语法特征正则（匹配典型注入逻辑）- 忽略大小写 */
    private static final Pattern DEFAULT_INJECT_PATTERN;
    /** 默认配置：检测到注入时抛出异常 */
    private static final boolean DEFAULT_THROW_EXCEPTION = true;

    static {
        // 初始化默认高危关键字
        DEFAULT_DANGER_KEYWORDS.add("UNION");
        DEFAULT_DANGER_KEYWORDS.add("SELECT"); // 仅拦截独立使用的SELECT（如需允许查询关键词，可移除）
        DEFAULT_DANGER_KEYWORDS.add("INSERT");
        DEFAULT_DANGER_KEYWORDS.add("UPDATE");
        DEFAULT_DANGER_KEYWORDS.add("DELETE");
        DEFAULT_DANGER_KEYWORDS.add("DROP");
        DEFAULT_DANGER_KEYWORDS.add("ALTER");
        DEFAULT_DANGER_KEYWORDS.add("TRUNCATE");
        DEFAULT_DANGER_KEYWORDS.add("EXEC");
        DEFAULT_DANGER_KEYWORDS.add("EXECUTE");
        DEFAULT_DANGER_KEYWORDS.add("CALL");
        DEFAULT_DANGER_KEYWORDS.add("CREATE");
        DEFAULT_DANGER_KEYWORDS.add("MERGE");
        DEFAULT_DANGER_KEYWORDS.add("LOAD_FILE");
        DEFAULT_DANGER_KEYWORDS.add("INTO_DUMPFILE");
        DEFAULT_DANGER_KEYWORDS.add("OR 1=1");
        DEFAULT_DANGER_KEYWORDS.add("AND 1=1");

        // 初始化默认高危符号（支持单字符/多字符）
        DEFAULT_DANGER_CHARS.add(";"); // 语句终止符
        //DEFAULT_DANGER_CHARS.add("--"); // 单行注释（双连字符）
        //DEFAULT_DANGER_CHARS.add("#"); // 单行注释
        //DEFAULT_DANGER_CHARS.add("/*"); // 多行注释开始
        //DEFAULT_DANGER_CHARS.add("*/"); // 多行注释结束
        //DEFAULT_DANGER_CHARS.add("\\"); // 转义符
        DEFAULT_DANGER_CHARS.add("|"); // 管道符
        //DEFAULT_DANGER_CHARS.add("'"); // 单引号（注入拼接符）
        //DEFAULT_DANGER_CHARS.add("\""); // 双引号（拼接符）

        // 初始化注入语法特征正则
        DEFAULT_INJECT_PATTERN = Pattern.compile(
                "('\\s*OR\\s*')|('\\s*AND\\s*')|(\\bUNION\\s+SELECT\\b)|(\\bSELECT\\s+.*\\s+FROM\\b)|" +
                        "(\\--)|(#)|(/\\*)|(\\*/)|(\\bEXEC\\s+)|(\\bCALL\\s+)|(\\bDROP\\s+TABLE\\b)",
                Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        );
    }

    // -------------------------- 可配置参数（新增 throwExceptionOnInjection） --------------------------
    private final Set<String> dangerKeywords;
    private final Set<String> dangerChars;
    private final Pattern injectPattern;
    private final boolean allowSelectKeyword;
    private final String legalCharRegex;
    private final boolean throwExceptionOnInjection; // 新增：是否抛出异常配置

    /**
     * 默认构造器（使用默认配置：抛出异常）
     */
    public SqlInjectionValidator() {
        this(DEFAULT_THROW_EXCEPTION, false, null, null, null);
    }

    /**
     * 简化构造器：仅配置是否抛出异常
     * @param throwExceptionOnInjection 检测到注入时是否抛出异常（true：抛出，false：不抛出）
     */
    public SqlInjectionValidator(boolean throwExceptionOnInjection) {
        this(throwExceptionOnInjection, false, null, null, null);
    }

    /**
     * 完整自定义构造器（支持所有配置项）
     * @param throwExceptionOnInjection 检测到注入时是否抛出异常（默认true）
     * @param allowSelectKeyword 是否允许SELECT关键字（默认false）
     * @param extraDangerKeywords 额外高危关键字（可选）
     * @param extraDangerChars 额外高危符号（可选）
     * @param legalCharRegex 自定义合法字符正则（可选）
     */
    public SqlInjectionValidator(
            boolean throwExceptionOnInjection,
            boolean allowSelectKeyword,
            Set<String> extraDangerKeywords,
            Set<String> extraDangerChars,
            String legalCharRegex
    ) {
        this.dangerKeywords = new HashSet<>(DEFAULT_DANGER_KEYWORDS);
        this.dangerChars = new HashSet<>(DEFAULT_DANGER_CHARS);
        this.injectPattern = DEFAULT_INJECT_PATTERN;
        this.allowSelectKeyword = allowSelectKeyword;
        this.throwExceptionOnInjection = throwExceptionOnInjection; // 赋值配置项

        // 添加额外高危关键字
        if (extraDangerKeywords != null && !extraDangerKeywords.isEmpty()) {
            this.dangerKeywords.addAll(extraDangerKeywords);
        }

        // 添加额外高危符号
        if (extraDangerChars != null && !extraDangerChars.isEmpty()) {
            this.dangerChars.addAll(extraDangerChars);
        }

        // 自定义合法字符正则（为空则使用默认）
        this.legalCharRegex = StringUtils.isBlank(legalCharRegex)
                ? "^[a-zA-Z0-9\u4e00-\u9fa5\\s,\\.，。、；:：（）()\\[\\]{}【】\\-/_@￥$%^&*？?！!]+$"
                : legalCharRegex;
    }

    // -------------------------- 核心验证方法（适配异常配置） --------------------------
    /**
     * 验证字符串是否存在SQL注入风险
     * @param input 待验证的输入字符串
     * @return true：安全；false：存在注入风险（仅当 throwExceptionOnInjection=false 时返回false）
     * @throws IllegalArgumentException 存在注入风险且 throwExceptionOnInjection=true 时抛出
     */
    public boolean isValid(String input) {
        // 1. 空值直接放行
        if (StringUtils.isBlank(input)) {
            return true;
        }

        String lowerInput = input.toLowerCase();
        String dangerDetail = null;
        String dangerReason = null;

        // 2. 高危符号校验（优先匹配长字符）
        String[] sortedDangerChars = dangerChars.stream()
                .sorted((a, b) -> Integer.compare(b.length(), a.length()))
                .toArray(String[]::new);
        for (String dangerChar : sortedDangerChars) {
            if (StringUtils.isBlank(dangerChar) || !input.contains(dangerChar)) {
                continue;
            }
            dangerReason = "包含高危符号";
            dangerDetail = dangerChar;
            break;
        }

        // 3. 高危关键字校验（未检测到符号风险时继续）
        if (dangerReason == null) {
            for (String keyword : dangerKeywords) {
                if (allowSelectKeyword && "SELECT".equalsIgnoreCase(keyword)) {
                    continue;
                }
                if (Pattern.compile("\\b" + Pattern.quote(keyword.toLowerCase()) + "\\b").matcher(lowerInput).find()) {
                    dangerReason = "包含高危关键字";
                    dangerDetail = keyword;
                    break;
                }
            }
        }

        // 4. 注入语法特征校验（未检测到前两类风险时继续）
        if (dangerReason == null && injectPattern.matcher(input).find()) {
            dangerReason = "包含注入语法特征";
            dangerDetail = injectPattern.pattern();
        }

        // 5. 合法字符校验（未检测到前三类风险时继续）
        /*if (dangerReason == null && !Pattern.matches(legalCharRegex, input)) {
            dangerReason = "包含非法字符";
            dangerDetail = legalCharRegex;
        }*/

        // 6. 根据配置决定是否抛出异常
        if (dangerReason != null) {
            logDanger(dangerReason, input, dangerDetail);
            if (throwExceptionOnInjection) {
                // 抛出异常（包含详细信息，脱敏输入）
                throw new IllegalArgumentException(
                        String.format("存在SQL注入风险 - %s：%s，输入（脱敏）：%s",
                                dangerReason, dangerDetail, StringUtils.abbreviate(input, 50))
                );
            } else {
                // 不抛出异常，返回false
                return false;
            }
        }

        // 所有校验通过
        return true;
    }

    /**
     * 重载方法：指定字段名，异常信息更友好
     * @param input 待验证字符串
     * @param fieldName 字段名（用于异常提示）
     * @return true：安全；false：存在注入风险（仅当 throwExceptionOnInjection=false 时）
     * @throws IllegalArgumentException 存在注入风险且配置开启时抛出
     */
    public boolean isValid(String input, String fieldName) {
        if (StringUtils.isBlank(input)) {
            return true;
        }

        try {
            return isValid(input);
        } catch (IllegalArgumentException e) {
            // 补充字段名到异常信息
            throw new IllegalArgumentException(
                    String.format("字段【%s】%s", fieldName, e.getMessage()), e
            );
        }
    }

    /**
     * 强制验证（无论配置如何，均抛出异常，兼容原有 validateOrThrow 逻辑）
     * @param input 待验证字符串
     * @param fieldName 字段名
     * @throws IllegalArgumentException 存在注入风险时必抛
     */
    public void validateOrThrow(String input, String fieldName) {
        // 临时开启抛出异常，确保强制抛出
        boolean originalConfig = this.throwExceptionOnInjection;
        try {
            // 通过反射临时修改配置（仅当前验证生效，不影响全局）
            java.lang.reflect.Field field = SqlInjectionValidator.class.getDeclaredField("throwExceptionOnInjection");
            field.setAccessible(true);
            field.set(this, true);
            isValid(input, fieldName);
        } catch (NoSuchFieldException | IllegalAccessException ex) {
            // 反射失败时直接调用原方法，依赖原有配置
            isValid(input, fieldName);
        } finally {
            // 恢复原有配置
            try {
                java.lang.reflect.Field field = SqlInjectionValidator.class.getDeclaredField("throwExceptionOnInjection");
                field.setAccessible(true);
                field.set(this, originalConfig);
            } catch (NoSuchFieldException | IllegalAccessException ex) {
                logDanger("恢复配置失败", "", ex.getMessage());
            }
        }
    }

    // -------------------------- 辅助方法 --------------------------
    private void logDanger(String reason, String input, String detail) {
        System.err.printf("SQL注入风险检测 - 原因：%s，输入（脱敏）：%s，详情：%s%n",
                reason, StringUtils.abbreviate(input, 50), detail);
    }

    // -------------------------- 静态工具方法（支持自定义配置） --------------------------
    /**
     * 快速验证（使用默认配置：抛出异常）
     */
    public static boolean quickValidate(String input) {
        return new SqlInjectionValidator().isValid(input);
    }

    /**
     * 快速验证（支持配置是否抛出异常）
     * @param input 待验证字符串
     * @param throwException 是否抛出异常
     * @return true：安全；false：存在风险（仅当 throwException=false 时）
     */
    public static boolean quickValidate(String input, boolean throwException) {
        return new SqlInjectionValidator(throwException).isValid(input);
    }

    /**
     * 快速验证（指定字段名，默认抛出异常）
     */
    public static boolean quickValidate(String input, String fieldName) {
        return new SqlInjectionValidator().isValid(input, fieldName);
    }

    /**
     * 快速验证（指定字段名和是否抛出异常）
     */
    public static boolean quickValidate(String input, String fieldName, boolean throwException) {
        return new SqlInjectionValidator(throwException).isValid(input, fieldName);
    }

    /**
     * 搜索场景专用验证（允许SELECT，默认抛出异常）
     */
    public static boolean searchValidate(String input) {
        return new SqlInjectionValidator(DEFAULT_THROW_EXCEPTION, true, null, null, null).isValid(input);
    }

    /**
     * 搜索场景专用验证（允许SELECT，支持配置是否抛出异常）
     */
    public static boolean searchValidate(String input, boolean throwException) {
        return new SqlInjectionValidator(throwException, true, null, null, null).isValid(input);
    }

    // -------------------------- 测试方法 --------------------------
    public static void main(String[] args) {
        String dangerousInput = "admin' OR 1=1 --";

        // 测试1：默认配置（抛出异常）
        try {
            SqlInjectionValidator.quickValidate(dangerousInput, "用户名");
        } catch (IllegalArgumentException e) {
            System.out.println("测试1结果：" + e.getMessage());
            // 输出：测试1结果：字段【用户名】存在SQL注入风险 - 包含高危符号：'，输入（脱敏）：admin' OR 1=1 --
        }

        // 测试2：关闭抛出异常（返回false，不抛异常）
        boolean result = SqlInjectionValidator.quickValidate(dangerousInput, "用户名", false);
        System.out.println("测试2结果：是否安全？" + result); // 输出：测试2结果：是否安全？false

        // 测试3：搜索场景（允许SELECT，关闭抛出异常）
        String searchInput = "SELECT语句教程";
        boolean searchResult = SqlInjectionValidator.searchValidate(searchInput, false);
        System.out.println("测试3结果：搜索关键词是否安全？" + searchResult); // 输出：测试3结果：搜索关键词是否安全？true

        // 测试4：自定义配置（添加额外关键字，关闭抛出异常）
        Set<String> extraKeywords = new HashSet<>();
        extraKeywords.add("IMPORT");
        SqlInjectionValidator validator = new SqlInjectionValidator(false, false, extraKeywords, null, null);
        boolean customResult = validator.isValid("test IMPORT data");
        System.out.println("测试4结果：是否安全？" + customResult); // 输出：测试4结果：是否安全？false
    }
}