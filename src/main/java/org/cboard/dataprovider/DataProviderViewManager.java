package org.cboard.dataprovider;

import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.QueryParameter;
import com.google.common.collect.Ordering;
import org.apache.commons.io.output.StringBuilderWriter;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
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
        props.setProperty("resource.loader", "class");
        props.setProperty("class.resource.loader.class", "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
        velocityEngine = new VelocityEngine(props);
    }

    private static Map<String, String> rendered = new HashMap<>();

    public static String getQueryView(String type) {
        Class clz = DataProviderManager.getDataProviderClass(type);

        Set<Field> fieldSet = ReflectionUtils.getAllFields(clz, ReflectionUtils.withAnnotation(QueryParameter.class));
        List<Field> fieldList = fieldOrdering.sortedCopy(fieldSet);
        try {
            Object o = clz.newInstance();
            List<Map<String, String>> lists = new ArrayList<>();
            for (Field field : fieldList) {
                field.setAccessible(true);
                QueryParameter queryParameter = field.getAnnotation(QueryParameter.class);
                Map<String, String> param = new HashMap<>();
                param.put("label", queryParameter.label());
                param.put("type", queryParameter.type().toString());
                param.put("name", (String) field.get(o));
                lists.add(param);
            }
            VelocityContext context = new VelocityContext();
            context.put("params", lists);
            StringBuilderWriter stringBuilderWriter = new StringBuilderWriter();
            velocityEngine.mergeTemplate("template/config/query.vm", "utf-8", context, stringBuilderWriter);
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
            List<Map<String, String>> lists = new ArrayList<>();
            for (Field field : fieldList) {
                field.setAccessible(true);
                DatasourceParameter datasourceParameter = field.getAnnotation(DatasourceParameter.class);
                Map<String, String> param = new HashMap<>();
                param.put("label", datasourceParameter.label());
                param.put("type", datasourceParameter.type().toString());
                param.put("name", (String) field.get(o));
                lists.add(param);
            }
            VelocityContext context = new VelocityContext();
            context.put("params", lists);
            StringBuilderWriter stringBuilderWriter = new StringBuilderWriter();
            velocityEngine.mergeTemplate("template/config/datasource.vm", "utf-8", context, stringBuilderWriter);
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
