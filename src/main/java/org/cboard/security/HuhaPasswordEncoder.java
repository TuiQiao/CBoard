package org.cboard.security;

import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * @author WangKun
 * @create 2018-08-10
 * @desc
 **/
public class HuhaPasswordEncoder implements PasswordEncoder {
    @Override
    public String encode(CharSequence charSequence) {
        return charSequence.toString();
    }

    @Override
    public boolean matches(CharSequence charSequence, String s) {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder().matches(charSequence, "{MD5}" + s);
    }
}
