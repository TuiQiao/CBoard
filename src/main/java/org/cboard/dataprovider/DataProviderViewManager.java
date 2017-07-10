package org.cboard.dataprovider;

import com.google.common.collect.Ordering;
import org.apache.commons.io.output.StringBuilderWriter;
import org.apache.commons.lang.StringUtils;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.runtime.RuntimeConstants;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.reflections.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.*;

/**
 * Created by yfyuan on 2016/8/15.
 */
public class DataProviderViewManager {

    private static VelocityEngine velocityEngine;

    static {
        Properties props = new Properties();
        String fileDir = DataProviderViewManager.class.getResource("/template/config").getPath();
        props.setProperty(RuntimeConstants.RUNTIME_LOG_LOGSYSTEM_CLASS, "org.apache.velocity.runtime.log.Log4JLogChute");
        props.setProperty(velocityEngine.FILE_RESOURCE_LOADER_PATH, fileDir);
        props.setProperty(Velocity.OUTPUT_ENCODING, "UTF-8");
        props.setProperty(Velocity.INPUT_ENCODING, "UTF-8");
        props.setProperty("runtime.log.logsystem.log4j.logger", "velocity");
        props.setProperty("log4j.logger.org.apache.velocity", "ERROR");
        velocityEngine = new VelocityEngine(props);
    }

    private static Map<String, String> rendered = new HashMap<>();

    public static String getQueryView(String type, String page) {
        Class clz = DataProviderManager.getDataProviderClass(type);

        Set<Field> fieldSet = ReflectionUtils.getAllFields(clz, ReflectionUtils.withAnnotation(QueryParameter.class));
        List<Field> fieldList = fieldOrdering.sortedCopy(fieldSet);
        try {
            Object o = clz.newInstance();
            List<Map<String, Object>> lists = new ArrayList<>();
            for (Field field : fieldList) {
                field.setAccessible(true);
                QueryParameter queryParameter = field.getAnnotation(QueryParameter.class);
                Map<String, Object> param = new HashMap<>();
                param.put("label", queryParameter.label());
                param.put("type", queryParameter.type().toString());
                param.put("name", (String) field.get(o));
                param.put("placeholder", queryParameter.placeholder());
                param.put("value", queryParameter.value());
                param.put("options", queryParameter.options());
                param.put("checked", queryParameter.checked());

                /*
                不同页面显示不同输入框
                 */
                String pageType = queryParameter.pageType();
                if (pageType.contains("all") || StringUtils.isBlank(page)) {
                    lists.add(param);
                } else if ("test.html".equals(page) && pageType.contains("test")) {
                    lists.add(param);
                } else if ("dataset.html".equals(page) && pageType.contains("dataset")) {
                    lists.add(param);
                } else if ("widget.html".equals(page) && pageType.contains("widget")) {
                    lists.add(param);
                } else {
                    continue;
                }

            }
            VelocityContext context = new VelocityContext();
            context.put("params", lists);
            StringBuilderWriter stringBuilderWriter = new StringBuilderWriter();
            velocityEngine.mergeTemplate("query.vm", "utf-8", context, stringBuilderWriter);
            return stringBuilderWriter.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static String getDatasourceView(String type) {
        Class clz = DataProviderManager.getDataProviderClass(type);

        Set<Field> fieldSet = ReflectionUtils.getAllFields(clz, ReflectionUtils.withAnnotation(DatasourceParameter.class));
        List<Field> fieldList = fieldOrdering.sortedCopy(fieldSet);
        try {
            Object o = clz.newInstance();
            List<Map<String, Object>> lists = new ArrayList<>();
            for (Field field : fieldList) {
                field.setAccessible(true);
                DatasourceParameter datasourceParameter = field.getAnnotation(DatasourceParameter.class);
                Map<String, Object> param = new HashMap<>();
                param.put("label", datasourceParameter.label());
                param.put("type", datasourceParameter.type().toString());
                param.put("name", (String) field.get(o));
                param.put("placeholder", datasourceParameter.placeholder());
                param.put("value", datasourceParameter.value());
                param.put("options", datasourceParameter.options());
                param.put("checked", datasourceParameter.checked());
                lists.add(param);
            }
            VelocityContext context = new VelocityContext();
            context.put("params", lists);
            StringBuilderWriter stringBuilderWriter = new StringBuilderWriter();
            velocityEngine.mergeTemplate("datasource.vm", "utf-8", context, stringBuilderWriter);
            return stringBuilderWriter.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private static Ordering<Field> fieldOrdering = Ordering.from(new Comparator<Field>() {
        @Override
        public int compare(Field o1, Field o2) {
            return Integer.compare(getOrder(o1), getOrder(o2));
        }

        private int getOrder(Field field) {
            field.setAccessible(true);
            DatasourceParameter datasourceParameter = field.getAnnotation(DatasourceParameter.class);
            if (datasourceParameter != null) {
                return datasourceParameter.order();
            }
            QueryParameter queryParameter = field.getAnnotation(QueryParameter.class);
            if (queryParameter != null) {
                return queryParameter.order();
            }
            return 0;
        }
    });

}