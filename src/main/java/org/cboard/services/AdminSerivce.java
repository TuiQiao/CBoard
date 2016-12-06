package org.cboard.services;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import org.cboard.dao.RoleDao;
import org.cboard.dao.UserDao;
import org.cboard.pojo.DashboardRole;
import org.cboard.pojo.DashboardUser;
import org.cboard.pojo.DashboardUserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by yfyuan on 2016/12/2.
 */
@Repository
public class AdminSerivce {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    public String addUser(String userId, String loginName, String userName, String userPassword) {
        String md5 = Hashing.md5().newHasher().putString(userPassword, Charsets.UTF_8).hash().toString();
        DashboardUser user = new DashboardUser();
        user.setLoginName(loginName);
        user.setUserId(userId);
        user.setUserName(userName);
        user.setUserPassword(md5);
        userDao.save(user);
        return "1";
    }

    public String updateUser(String userId, String loginName, String userName) {
        DashboardUser user = new DashboardUser();
        user.setLoginName(loginName);
        user.setUserId(userId);
        user.setUserName(userName);
        userDao.update(user);
        return "1";
    }

    public String addRole(String roleId, String roleName) {
        DashboardRole role = new DashboardRole();
        role.setRoleId(roleId);
        role.setRoleName(roleName);
        roleDao.save(role);
        return "1";
    }

    public String updateRole(String roleId, String roleName) {
        DashboardRole role = new DashboardRole();
        role.setRoleId(roleId);
        role.setRoleName(roleName);
        roleDao.update(role);
        return "1";
    }

    public String updateUserRole(String[] userId, String[] roleId) {
        for (String uid : userId) {
            userDao.deleteUserRole(uid);
            if (roleId != null && roleId.length > 0) {
                List<DashboardUserRole> list = new ArrayList<>();
                for (String rid : roleId) {
                    DashboardUserRole userRole = new DashboardUserRole();
                    userRole.setUserId(uid);
                    userRole.setRoleId(rid);
                    list.add(userRole);
                }
                userDao.saveUserRole(list);
            }
        }
        return "1";
    }
}
