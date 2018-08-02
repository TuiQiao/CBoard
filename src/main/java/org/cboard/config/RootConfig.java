package org.cboard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * @author WangKun
 * @create 2018-07-25
 * @desc SecurityJDBCConfig/SecurityCASConfig
 * Switching steps:
 * 1.RootConfig.java; @Import
 * 2.SecurityJDBCConfig.java or SecurityCASConfig.java  @EnableWebSecurity
 * 3.ApplicationInitializer.java registerFilter()
 **/
@Configuration
@Import({DataSourceConfig.class, CacheConfig.class, SecurityJDBCConfig.class})
//@Import({DataSourceConfig.class, CacheConfig.class, SecurityCASConfig.class})
public class RootConfig {

}
