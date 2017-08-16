package org.cboard.services;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.lang.StringUtils;
import org.cboard.dao.*;
import org.cboard.pojo.*;
import org.cboard.services.role.RolePermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Created by yfyuan on 2016/12/2.
 */
@Repository
public class AdminSerivce {

    @Value("${admin_user_id:1}")
    private String adminUid;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private WidgetDao widgetDao;

    @Autowired
    private BoardDao boardDao;

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

    public String updateUser(String userId, String loginName, String userName, String userPassword) {
        DashboardUser user = new DashboardUser();
        user.setLoginName(loginName);
        user.setUserId(userId);
        user.setUserName(userName);
        if (StringUtils.isNotBlank(userPassword)) {
            String md5 = Hashing.md5().newHasher().putString(userPassword, Charsets.UTF_8).hash().toString();
            user.setUserPassword(md5);
        }
        userDao.update(user);
        return "1";
    }

    @Transactional
    public String deleteUser(String userId) {
        userDao.deleteUserById(userId);
        Map param = new HashMap<String,String>();
        param.put("objUid", userId);
        userDao.deleteUserRole(param);
        return "1";
    }

    public String addRole(String roleId, String roleName, String userId) {
        DashboardRole role = new DashboardRole();
        role.setRoleId(roleId);
        role.setRoleName(roleName);
        role.setUserId(userId);
        roleDao.save(role);
        return "1";
    }

    public String updateRole(String roleId, String roleName, String userId) {
        DashboardRole role = new DashboardRole();
        role.setRoleId(roleId);
        role.setRoleName(roleName);
        role.setUserId(userId);
        roleDao.update(role);
        return "1";
    }

    @Transactional
    public String deleteRole(String roleId) {
        userDao.deleteUserRoleByRoleId(roleId);
        roleDao.deleteRoleRes(roleId);
        roleDao.deleteRole(roleId);
        return "1";
    }

    public String updateUserRole(String[] userId, String[] roleId, final String curUid) {

        for (String uid : userId) {
            Map<String, Object> params = new HashedMap();
            params.put("objUid", uid);
            params.put("curUid", curUid);
            params.put("adminUid", adminUid);
            userDao.deleteUserRole(params);
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

    public String deleteUserRoles(String[] userId, String[] roleId, final String curUid) {

        Map<String, Object> params = new HashedMap();
        params.put("userIds", userId);
        params.put("roleIds", roleId);
        params.put("curUid", curUid);
        params.put("adminUid", adminUid);
        userDao.deleteUserRoles(params);
        return "1";
    }

    public String updateRoleResUser(String[] roleId, String resIdArr) {
        JSONArray arr = JSONArray.parseArray(resIdArr);
        for (Object res : arr) {
            JSONObject jo = (JSONObject) res;
            roleDao.deleteRoleResByResId(jo.getLong("resId"), jo.getString("resType"));
            for (String rid : roleId) {
                DashboardRoleRes roleRes = new DashboardRoleRes();
                roleRes.setRoleId(rid);
                roleRes.setResId(jo.getLong("resId"));
                roleRes.setResType(jo.getString("resType"));
                roleRes.setPermission("" + (false ? 1 : 0) + (false ? 1 : 0));
                roleDao.saveRoleRes(roleRes);
            }            
        }
        return "1";
    }

    public String updateRoleRes(String[] roleId, String resIdArr) {

        JSONArray arr = JSONArray.parseArray(resIdArr);
        for (String rid : roleId) {
            roleDao.deleteRoleRes(rid);
            if (arr != null && arr.size() > 0) {
                for (Object res : arr) {
                    JSONObject jo = (JSONObject) res;
                    DashboardRoleRes roleRes = new DashboardRoleRes();
                    roleRes.setRoleId(rid);
                    roleRes.setResId(jo.getLong("resId"));
                    roleRes.setResType(jo.getString("resType"));
                    boolean edit = jo.getBooleanValue("edit");
                    boolean delete = jo.getBooleanValue("delete");
                    roleRes.setPermission("" + (edit ? 1 : 0) + (delete ? 1 : 0));
                    roleDao.saveRoleRes(roleRes);
                }
            }
        }
        return "1";
    }

    public ServiceStatus changePwd(String userId, String curPwd, String newPwd, String cfmPwd) {
        curPwd = Hashing.md5().newHasher().putString(curPwd, Charsets.UTF_8).hash().toString();
        newPwd = Hashing.md5().newHasher().putString(newPwd, Charsets.UTF_8).hash().toString();
        cfmPwd = Hashing.md5().newHasher().putString(cfmPwd, Charsets.UTF_8).hash().toString();
        if (newPwd.equals(cfmPwd)) {
            if (userDao.updateUserPassword(userId, curPwd, newPwd) == 1) {
                return new ServiceStatus(ServiceStatus.Status.Success, "success");
            }
        }
        return null;
    }

    public List<DashboardBoard> getBoardList(String userId) {
        if (adminUid.equals(userId)) {
            return boardDao.getBoardList(userId);
        } else {
            List<DashboardRoleRes> resList = roleDao.getUserRoleResList(userId, "board");

            List<Long> resIdList = resList.stream().filter(e -> RolePermission.isEdit(e.getPermission())).map(e -> e.getResId()).distinct().collect(Collectors.toList());
            return boardDao.getBoardList(userId).stream().filter(e -> resIdList.contains(e.getId()) || e.getUserId().equals(userId)).collect(Collectors.toList());
        }
    }

    public List<DashboardDataset> getDatasetList(String userId) {
        if (adminUid.equals(userId)) {
            return datasetDao.getDatasetList(userId);
        } else {
            List<DashboardRoleRes> resList = roleDao.getUserRoleResList(userId, "dataset");
            List<Long> resIdList = resList.stream().filter(e -> RolePermission.isEdit(e.getPermission())).map(e -> e.getResId()).distinct().collect(Collectors.toList());
            return datasetDao.getDatasetList(userId).stream().filter(e -> resIdList.contains(e.getId()) || e.getUserId().equals(userId)).collect(Collectors.toList());
        }
    }

    public List<DashboardWidget> getWidgetList(String userId) {
        if (adminUid.equals(userId)) {
            return widgetDao.getWidgetList(userId);
        } else {
            List<DashboardRoleRes> resList = roleDao.getUserRoleResList(userId, "widget");
            List<Long> resIdList = resList.stream().filter(e -> RolePermission.isEdit(e.getPermission())).map(e -> e.getResId()).distinct().collect(Collectors.toList());
            return widgetDao.getWidgetList(userId).stream().filter(e -> resIdList.contains(e.getId()) || e.getUserId().equals(userId)).collect(Collectors.toList());
        }
    }


}
