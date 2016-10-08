package org.cboard.security.service;

import org.cboard.dto.User;
import org.cboard.services.AuthenticationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Created by yfyuan on 2016/9/29.
 */
public class InMemAuthenticationService implements AuthenticationService {
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
        org.springframework.security.core.userdetails.User user = (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        if (user == null) {
            return null;
        }
        return new User(user.getUsername(), user.getUsername());
    }
}
