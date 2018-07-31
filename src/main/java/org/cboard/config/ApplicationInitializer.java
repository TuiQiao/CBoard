package org.cboard.config;

import com.alibaba.druid.support.http.StatViewServlet;
import org.cboard.security.service.LocalSecurityFilter;
import org.jasig.cas.client.session.SingleSignOutFilter;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.request.RequestContextListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;

import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

/**
 * @author WangKun
 * @create 2018-07-25
 * @desc
 **/
public class ApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        initializeSpringAndSpringMVCConfig(servletContext);

        registerFilter(servletContext);
        registerListener(servletContext);
        registerServlet(servletContext);
    }

    private void registerServlet(ServletContext container) {
        initializeStatViewServlet(container);
    }

    private void registerFilter(ServletContext container) {
        initializeDelegatingFilterProxy(container);
        initializeSingleSignOutFilter(container);
        initializeLocalSecurityFilter(container);
        initializeCharacterEncodingFilter(container);
    }

    private void registerListener(ServletContext container) {
        container.addListener(RequestContextListener.class);
        container.addListener(SessionListener.class);
    }

    private void initializeSpringAndSpringMVCConfig(ServletContext container) {
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(RootConfig.class);
        rootContext.register(WebMvcConfig.class);
        container.addListener(new ContextLoaderListener(rootContext));
        ServletRegistration.Dynamic springMvc = container.addServlet("SpringMvc", new DispatcherServlet(rootContext));
        springMvc.setLoadOnStartup(1);
        springMvc.addMapping("*.do");

    }

    private void initializeStatViewServlet(ServletContext container) {
        StatViewServlet statViewServlet = new StatViewServlet();
//        ServletConfig servletConfig = new ServletConfig();
        ServletRegistration.Dynamic dynamic = container.addServlet("DruidStatView", statViewServlet);
        dynamic.setLoadOnStartup(2);
        dynamic.addMapping("/druid/*");
    }

    private void initializeDelegatingFilterProxy(ServletContext container) {
        FilterRegistration.Dynamic filterRegistration = container.addFilter("springSecurityFilterChain", DelegatingFilterProxy.class);
        filterRegistration.addMappingForUrlPatterns(null, false, "/*");
        filterRegistration.setAsyncSupported(true);
    }

    private void initializeSingleSignOutFilter(ServletContext container) {
        FilterRegistration.Dynamic filterRegistration = container.addFilter("CAS Single Sign Out Filter", SingleSignOutFilter.class);
        filterRegistration.addMappingForUrlPatterns(null, false, "/*");
        filterRegistration.setAsyncSupported(true);
    }

    private void initializeLocalSecurityFilter(ServletContext container) {
        FilterRegistration.Dynamic filterRegistration = container.addFilter("LocalSecurityFilter", LocalSecurityFilter.class);
        filterRegistration.addMappingForUrlPatterns(null, false, "/*");
        filterRegistration.setAsyncSupported(true);
    }

    private void initializeCharacterEncodingFilter(ServletContext container) {
        CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
        characterEncodingFilter.setEncoding("UTF-8");
        FilterRegistration.Dynamic filterRegistration = container.addFilter("encodingFilter", characterEncodingFilter);
        filterRegistration.addMappingForUrlPatterns(null, false, "/*");
        filterRegistration.setAsyncSupported(true);
    }

}
