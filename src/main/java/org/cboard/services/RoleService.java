package org.cboard.services;

import org.cboard.dao.RoleDao;
import org.cboard.pojo.DashboardRole;
import org.cboard.pojo.DashboardRoleRes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created by yfyuan on 2016/12/14.
 */
@Repository
public class RoleService {

    public static final String RES_BOARD = "board";

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private AuthenticationService authenticationService;

    public List<Long> getResRole(String resType) {
        String userid = authenticationService.getCurrentUser().getUserId();
        return roleDao.getRoleResByResIds(userid, resType);
    }

    public List<DashboardRole> getCurrentRoleList(){
        String userid = authenticationService.getCurrentUser().getUserId();
        return roleDao.getRoleList(userid);
    }

    public Set<Integer> getFolderIds(String userId){
        Set<Integer> resIds = new HashSet<>();
        //get Folder's auth
        List<DashboardRoleRes> roleres = roleDao.getUserRoleResList(userId, "folder");
        if (roleres != null && roleres.size() > 0) {
            resIds = roleres.stream().map(r -> r.getResId().intValue()).collect(Collectors.toSet());
        }
        return resIds;
    }
}
