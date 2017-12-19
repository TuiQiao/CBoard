package org.cboard.security.service;

import org.cboard.security.ShareAuthenticationToken;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

/**
 * Created by yfyuan on 2017/3/16.
 */
public class ShareAuthenticationProviderDecorator implements AuthenticationProvider {

    private AuthenticationProvider authenticationProvider;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (authentication instanceof ShareAuthenticationToken) {
            return authentication;
        } else {
            return authenticationProvider.authenticate(authentication);
        }
    }

    @Override
    public boolean supports(Class<?> aClass) {
        if (aClass.equals(ShareAuthenticationToken.class)) {
            return true;
        } else {
            return authenticationProvider.supports(aClass);
        }
    }

    public void setAuthenticationProvider(AuthenticationProvider authenticationProvider) {
        this.authenticationProvider = authenticationProvider;
    }
}
