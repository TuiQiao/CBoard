package org.cboard.dataprovider;

import org.cboard.dataprovider.aggregator.InnerAggregator;
import org.cboard.dataprovider.annotation.ProviderName;
import org.reflections.Reflections;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Created by yfyuan on 2016/8/15.
 */
@Service
public class DataProviderManager implements ApplicationContextAware {

    private static Map<String, Class<? extends DataProvider>> providers = new HashMap<>();

    private static ApplicationContext applicationContext;

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

    /*public static DataProvider getDataProvider(String type) throws Exception {
        return getDataProvider(type, null, null);
    }*/

    public static DataProvider getDataProvider(String type, Map<String, String> dataSource, Map<String, String> query) throws Exception {
        Class c = providers.get(type);
        ProviderName providerName = (ProviderName) c.getAnnotation(ProviderName.class);
        if (providerName.name().equals(type)) {
            DataProvider provider = (DataProvider) c.getConstructor(Map.class, Map.class).newInstance(dataSource, query);
            applicationContext.getAutowireCapableBeanFactory().autowireBean(provider);
            InnerAggregator innerAggregator = applicationContext.getBean(InnerAggregator.class);
            innerAggregator.setDataSource(dataSource);
            innerAggregator.setQuery(query);
            provider.setInnerAggregator(innerAggregator);
            return provider;
        }
        return null;
    }

    protected static Class<? extends DataProvider> getDataProviderClass(String type) {
        return providers.get(type);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
