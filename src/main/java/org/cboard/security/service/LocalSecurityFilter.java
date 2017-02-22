package org.cboard.security.service;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * Created by yfyuan on 2017/2/22.
 */
public class LocalSecurityFilter implements Filter {

    private static ThreadLocal<String> localUserId = new ThreadLocal<>();

    public static String getLocalUserId() {
        return localUserId.get();
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        Cookie[] cookies = ((HttpServletRequest) servletRequest).getCookies();
        for (Cookie c : cookies) {
            if ("CBLOCALUID".equals(c.getName())) {
                localUserId.set(c.getValue());
            }
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
