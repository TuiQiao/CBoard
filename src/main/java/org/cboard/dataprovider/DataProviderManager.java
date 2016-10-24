package org.cboard.dataprovider;

import org.cboard.dataprovider.annotation.ProviderName;
import org.reflections.Reflections;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Created by yfyuan on 2016/8/15.
 */
public class DataProviderManager {

    private static Map<String, Class<? extends DataProvider>> providers = new HashMap<>();

    static {
        Set<Class<?>> classSet = new Reflections("org.cboard").getTypesAnnotatedWith(ProviderName.class);
        for (Class c : classSet) {
            if (!c.isAssignableFrom(DataProvider.class)) {
                providers.put(((ProviderName) c.getAnnotation(ProviderName.class)).name(), c);
            } else {
                System.out.println("自定义DataProvider需要继承org.cboard.dataprovider.DataProvider");
            }
        }
    }

    public static Set<String> getProviderList() {
        return providers.keySet();
    }

    public static DataProvider getDataProvider(String type) throws Exception {
        Class c = providers.get(type);
        ProviderName providerName = (ProviderName) c.getAnnotation(ProviderName.class);
        if (providerName.name().equals(type)) {
            return (DataProvider) c.newInstance();
        }
        return null;
    }

    protected static Class<? extends DataProvider> getDataProviderClass(String type) {
        return providers.get(type);
    }
}
