package org.cboard.security.service;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Enumeration;

/**
 * Created by yfyuan on 2017/2/22.
 */
public class LogFilter implements Filter {


    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {


        HttpServletRequest request = ((HttpServletRequest) servletRequest);
        Enumeration<String> e = request.getHeaderNames();
        do {
            String s = e.nextElement();
            System.out.println(s + " : " + request.getHeader(s));
        } while (e.hasMoreElements());
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
