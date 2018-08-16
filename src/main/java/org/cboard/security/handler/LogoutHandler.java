package org.cboard.security.handler;

import org.cboard.dto.CBoardActionLog;
import org.cboard.dto.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author WangKun
 * @create 2018-07-31
 * @desc
 **/
public class LogoutHandler implements LogoutSuccessHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(LogoutHandler.class);

    private User user;

    @Override
    public void onLogoutSuccess(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Authentication authentication) throws IOException, ServletException {

        String url = httpServletRequest.getRequestURL().toString();
        if (authentication != null) {
            user = (User) authentication.getPrincipal();
            String log = new CBoardActionLog(user, url).toString();
            LOGGER.info(log);
        }
        httpServletResponse.sendRedirect(httpServletRequest.getContextPath() + "/login?logout");
    }
}
