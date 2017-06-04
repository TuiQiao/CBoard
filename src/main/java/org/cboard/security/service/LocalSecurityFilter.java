package org.cboard.security.service;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.apache.commons.lang.StringUtils;
import org.cboard.dto.User;
import org.cboard.security.ShareAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;

/**
 * Created by yfyuan on 2017/2/22.
 */
public class LocalSecurityFilter implements Filter {

    private static LoadingCache<String, String> sidCache = CacheBuilder.newBuilder().expireAfterAccess(1, TimeUnit.MINUTES).build(new CacheLoader<String, String>() {
        @Override
        public String load(String key) throws Exception {
            return null;
        }
    });

    public static void put(String sid, String uid) {
        sidCache.put(sid, uid);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        if ("/render.html".equals(((HttpServletRequest) servletRequest).getServletPath())) {
            String sid = ((HttpServletRequest) servletRequest).getParameter("sid");
            try {
                String uid = sidCache.get(sid);
                if (StringUtils.isNotEmpty(uid)) {
                    User user = new User("shareUser", "", new ArrayList<>());
                    user.setUserId(sidCache.get(sid));
                    SecurityContext context = SecurityContextHolder.getContext();
                    context.setAuthentication(new ShareAuthenticationToken(user));
                    ((HttpServletRequest) servletRequest).getSession().setAttribute("SPRING_SECURITY_CONTEXT", context);
                }
            } catch (Exception e) {
                //e.printStackTrace();
            }
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
