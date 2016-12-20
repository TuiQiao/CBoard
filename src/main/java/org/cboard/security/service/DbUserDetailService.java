package org.cboard.security.service;

import org.cboard.dto.User;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.jdbc.JdbcDaoImpl;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * Created by yfyuan on 2016/12/14.
 */
public class DbUserDetailService extends JdbcDaoImpl {

    protected List<UserDetails> loadUsersByUsername(final String username) {
        return this.getJdbcTemplate().query(super.getUsersByUsernameQuery(), new String[]{username}, new RowMapper() {
            public UserDetails mapRow(ResultSet rs, int rowNum) throws SQLException {
                String userId = rs.getString(1);
                String username = rs.getString(2);
                String loginname = rs.getString(3);
                String password = rs.getString(4);
                boolean enabled = rs.getBoolean(5);
                User user = new User(loginname, password, enabled, true, true, true, AuthorityUtils.NO_AUTHORITIES);
                user.setUserId(userId);
                user.setName(username);
                return user;
            }
        });
    }

    protected UserDetails createUserDetails(String username, UserDetails userFromUserQuery, List<GrantedAuthority> combinedAuthorities) {
        return userFromUserQuery;
    }

}
