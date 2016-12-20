package org.cboard.dao;

import org.cboard.pojo.DashboardUser;
import org.cboard.pojo.DashboardUserRole;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by yfyuan on 2016/12/2.
 */
@Repository
public interface UserDao {
    int save(DashboardUser user);

    List<DashboardUser> getUserList();

    int update(DashboardUser user);

    int saveUserRole(List<DashboardUserRole> list);

    int deleteUserRole(String userId);

    List<DashboardUserRole> getUserRoleList();

    DashboardUser getUserByLoginName(String loginName);

    int saveNewUser(String userId, String user_name, String loginName);
}
