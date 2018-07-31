package org.cboard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * @author WangKun
 * @create 2018-07-25
 * @desc
 **/
@Configuration
@Import({DataSourceConfig.class, CacheConfig.class, SecurityJDBCConfig.class})
//@Import({DataSourceConfig.class, CacheConfig.class, SecurityCASConfig.class})
public class RootConfig {

}
