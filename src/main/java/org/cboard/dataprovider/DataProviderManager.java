package org.cboard.dataprovider;

import org.cboard.dataprovider.annotation.ProviderName;
import org.reflections.Reflections;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.GenericBeanDefinition;
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
public class DataProviderManager implements ApplicationContextAware, BeanFactoryPostProcessor {

    private static Map<String, Class<? extends DataProvider>> providers = new HashMap<>();

    private static ApplicationContext applicationContext;

    private static ConfigurableListableBeanFactory configurableListableBeanFactory;

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
            DataProvider provider = (DataProvider) c.newInstance();
            applicationContext.getAutowireCapableBeanFactory().autowireBean(provider);
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

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
        this.configurableListableBeanFactory = configurableListableBeanFactory;
    }
}
