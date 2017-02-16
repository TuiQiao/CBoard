package org.cboard.security.service;

import org.cboard.dao.UserDao;
import org.cboard.dto.User;
import org.cboard.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;

/**
 * Created by yfyuan on 2016/12/14.
 */
public class DbAuthenticationService implements AuthenticationService {

    @Value("${admin_user_id}")
    private String adminId;

    @Override
    public User getCurrentUser() {
        SecurityContext context = SecurityContextHolder.getContext();
        if (context == null) {
            return null;
        }
        Authentication authentication = context.getAuthentication();
        if (authentication == null) {
            return null;
        }
        if ("anonymousUser".equals(authentication.getPrincipal())) {
            User user = new User("admin", "", new ArrayList<>());
            user.setUserId(adminId);
            return user;
        }
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            return null;
        }
        return user;
    }

}
