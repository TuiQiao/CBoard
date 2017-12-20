package org.cboard.controller;

import org.springframework.context.annotation.*;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter;

import java.nio.charset.Charset;
import java.util.Iterator;
import java.util.List;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = {"org.cboard.controller"})
@PropertySource(value = {"classpath:config.properties"})
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class WebConfig extends WebMvcConfigurerAdapter {

    @Bean
    public RequestMappingHandlerAdapter requestMappingHandlerAdapter() {
        RequestMappingHandlerAdapter adapter = new RequestMappingHandlerAdapter();
        // @ResponseBody注解靠HttpMessageConverter解析
        List<HttpMessageConverter<?>> converters = adapter.getMessageConverters();
        Iterator<HttpMessageConverter<?>> iterator = converters.iterator();
        while (iterator.hasNext()) {
            HttpMessageConverter<?> converter = iterator.next();
            if (converter instanceof StringHttpMessageConverter) {  // 移除默认编码为ISO8859-1的字符串解析器
                iterator.remove();
            }
        }
        converters.add(new StringHttpMessageConverter(Charset.forName("UTF-8")));  // 字符串才使用UTF-8解析
        converters.add(new MappingJackson2HttpMessageConverter());  // 解析json
        adapter.setMessageConverters(converters);
        return adapter;
    }

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfigIn() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}
