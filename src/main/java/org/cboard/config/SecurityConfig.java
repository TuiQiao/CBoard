package org.cboard.config;

import com.alibaba.druid.pool.DruidDataSource;
import org.cboard.security.service.DbUserDetailService;
import org.cboard.security.service.DefaultAuthenticationService;
import org.cboard.security.service.ShareAuthenticationProviderDecorator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * @author WangKun
 * @create 2018-07-25
 * @desc
 **/
@Configuration
@EnableWebSecurity
@Import(DataSourceConfig.class)
@Order(2)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private DruidDataSource druidDataSource;

    @Bean
    public Md5PasswordEncoder md5PasswordEncoder() {
        return new Md5PasswordEncoder();
    }

    @Bean
    public DefaultAuthenticationService defaultAuthenticationService() {
        return new DefaultAuthenticationService();
    }

    @Bean
    public DbUserDetailService dbUserDetailService() {
        DbUserDetailService dbUserDetailService = new DbUserDetailService();
        dbUserDetailService.setDataSource(druidDataSource);
        dbUserDetailService.setAuthoritiesByUsernameQuery("SELECT login_name username, 'admin' AS authority FROM dashboard_user WHERE login_name = ?");
        dbUserDetailService.setUsersByUsernameQuery("SELECT user_id,user_name,login_name, user_password, 1 AS enabled FROM dashboard_user WHERE login_name = ? ");
        return dbUserDetailService;
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(dbUserDetailService());
        daoAuthenticationProvider.setPasswordEncoder(md5PasswordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public ShareAuthenticationProviderDecorator shareAuthenticationProviderDecorator() {
        ShareAuthenticationProviderDecorator share = new ShareAuthenticationProviderDecorator();
        share.setAuthenticationProvider(daoAuthenticationProvider());
        return share;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(shareAuthenticationProviderDecorator());
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers("/lib/**", "/dist/**", "/bootstrap/**", "/plugins/**", "/js/**", "/login/**", "/css/**");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
//        http.authorizeRequests().antMatchers("/**").access("!anonymous");
        http.authorizeRequests()
                .antMatchers("/login.do").permitAll()
                .anyRequest().authenticated()
                .and()
                    .formLogin()
                    .loginPage("/login.do")
//                    .loginProcessingUrl("/login.do")
//                    .successForwardUrl("")
                    .failureUrl("/login?error")
//                    .failureForwardUrl("")
                    .usernameParameter("username")
                    .passwordParameter("password")
                    .defaultSuccessUrl("/starter.html")
//                    .permitAll()
                .and()
                .logout()
                .logoutUrl("/j_spring_cas_security_logout")
                .logoutSuccessUrl("/login")
                .permitAll();
    }

}
