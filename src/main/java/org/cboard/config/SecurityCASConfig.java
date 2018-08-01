package org.cboard.config;

import org.cboard.security.service.DefaultAuthenticationService;
import org.cboard.security.service.ShareAuthenticationProviderDecorator;
import org.cboard.security.service.UserDetailsService;
import org.jasig.cas.client.validation.Cas20ServiceTicketValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfFilter;

import java.util.Arrays;
import java.util.List;

/**
 * @author WangKun
 * @create 2018-07-30
 * @desc
 **/
//@EnableWebSecurity
@Order(2)
@Import(PropertiesConfig.class)
public class SecurityCASConfig extends WebSecurityConfigurerAdapter {
    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityCASConfig.class);

    @Autowired
    private PropertiesConfig propertiesConfig;

    @Bean(name = "casAuthenticationService")
    public DefaultAuthenticationService defaultAuthenticationService() {
        return new DefaultAuthenticationService();
    }

    @Bean(name = "requestSingleLogoutFilter")
    public LogoutFilter logoutFilter() {
        LogoutFilter logoutFilter = new LogoutFilter(propertiesConfig.getLogout(), new SecurityContextLogoutHandler());
        logoutFilter.setFilterProcessesUrl("/j_spring_cas_security_logout");
        return logoutFilter;
    }

    @Bean
    public UserDetailsService authenticationUserDetailsService() {
        return new UserDetailsService(new String[]{"name", "employee", "mail", "givenName", "sn", "department", "company"});
    }

    @Bean
    public ServiceProperties serviceProperties() {
        ServiceProperties serviceProperties = new ServiceProperties();
        serviceProperties.setService(propertiesConfig.getCheck());
        serviceProperties.setSendRenew(false);
        return serviceProperties;
    }

    @Bean
    public CasAuthenticationProvider casAuthenticationProvider() {
        Cas20ServiceTicketValidator cas20ServiceTicketValidator = new Cas20ServiceTicketValidator(propertiesConfig.getUrl());
        cas20ServiceTicketValidator.setEncoding("UTF_8");
        CasAuthenticationProvider casAuthenticationProvider = new CasAuthenticationProvider();
        casAuthenticationProvider.setAuthenticationUserDetailsService(authenticationUserDetailsService());
        casAuthenticationProvider.setServiceProperties(serviceProperties());
        casAuthenticationProvider.setTicketValidator(cas20ServiceTicketValidator);
        casAuthenticationProvider.setKey("cas");
        return casAuthenticationProvider;
    }

    @Bean
    public CasAuthenticationEntryPoint casAuthenticationEntryPoint() {
        CasAuthenticationEntryPoint casAuthenticationEntryPoint = new CasAuthenticationEntryPoint();
        casAuthenticationEntryPoint.setLoginUrl(propertiesConfig.getLogin());
        casAuthenticationEntryPoint.setServiceProperties(serviceProperties());
        return casAuthenticationEntryPoint;
    }

    @Bean
    public CasAuthenticationFilter casAuthenticationFilter() {
        CasAuthenticationFilter casAuthenticationFilter = new CasAuthenticationFilter();
        try {
            casAuthenticationFilter.setAuthenticationManager(authenticationManagerBean());
        } catch (Exception e) {
            LOGGER.error("casAuthenticationFilter init error" + e);
        }
        return casAuthenticationFilter;
    }

    @Bean
    public ShareAuthenticationProviderDecorator shareAuthenticationProviderDecorator() {
        ShareAuthenticationProviderDecorator shareAuthenticationProviderDecorator = new ShareAuthenticationProviderDecorator();
        shareAuthenticationProviderDecorator.setAuthenticationProvider(casAuthenticationProvider());
        return shareAuthenticationProviderDecorator;
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers("/lib/**", "/dist/**", "/bootstrap/**", "/plugins/**", "/css/**");
    }

    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        List<AuthenticationProvider> providers = Arrays.asList(shareAuthenticationProviderDecorator());
        AuthenticationManager providerManager = new ProviderManager(providers);
        return providerManager;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable();
        http.authorizeRequests().anyRequest().authenticated();
        http.exceptionHandling().authenticationEntryPoint(casAuthenticationEntryPoint())
                .and()
                .addFilterBefore(logoutFilter(), LogoutFilter.class)
                .addFilterAfter(casAuthenticationFilter(), CsrfFilter.class);
    }
}
