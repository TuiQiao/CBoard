package org.cboard;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * @auther: WangKun
 * @date: 2018-08-14 17:17
 * @desc 项目信息
 */
@Component
public class CustomInfoContributor implements InfoContributor {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Value("${spring.profiles.active}")
    private String profile;

    @Override
    public void contribute(Info.Builder builder) {
        logger.debug("get service proile: {}", profile);
        builder.withDetail("profile", Collections.singletonMap("active", profile));
    }

}