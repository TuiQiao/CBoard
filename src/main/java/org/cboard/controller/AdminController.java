package org.cboard.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.collect.Lists;
import org.cboard.dao.*;
import org.cboard.dto.*;
import org.cboard.pojo.*;
import org.cboard.services.AdminSerivce;
import org.cboard.services.AuthenticationService;
import org.cboard.services.DatasourceService;
import org.cboard.services.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Created by yfyuan on 2016/12/2.
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminSerivce adminSerivce;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Value("${admin_user_id}")
    private String adminUserId;

    @Autowired
    private MenuDao menuDao;

    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private BoardDao boardDao;
    @Autowired
    private DatasetDao datasetDao;
    @Autowired
    private DatasourceDao datasourceDao;
    @Autowired
    private JobDao jobDao;
    @Autowired
    private WidgetDao widgetDao;
    @Autowired
    private MenuService menuService;
    @Autowired
    private DatasourceService datasourceService;


    @RequestMapping(value = "/saveNewUser")
    public String saveNewUser(@RequestParam(name = "user") String user) {
        JSONObject jsonObject = JSONObject.parseObject(user);
        return adminSerivce.addUser(UUID.randomUUID().toString(), jsonObject.getString("loginName"), jsonObject.getString("userName"), jsonObject.getString("userPassword"));
    }

    @RequestMapping(value = "/updateUser")
    public String updateUser(@RequestParam(name = "user") String user) {
        JSONObject jsonObject = JSONObject.parseObject(user);
        return adminSerivce.updateUser(jsonObject.getString("userId"), jsonObject.getString("loginName"), jsonObject.getString("userName"), jsonObject.getString("userPassword"));
    }

    @RequestMapping(value = "/getUserList")
    public List<DashboardUser> getUserList() {
        List<DashboardUser> list = userDao.getUserList();
        return list;
    }

    @RequestMapping(value = "/saveRole")
    public String saveRole(@RequestParam(name = "role") String role) {
        JSONObject jsonObject = JSONObject.parseObject(role);
        return adminSerivce.addRole(UUID.randomUUID().toString(), jsonObject.getString("roleName"), jsonObject.getString("userId"));
    }

    @RequestMapping(value = "/updateRole")
    public String updateRole(@RequestParam(name = "role") String role) {
        JSONObject jsonObject = JSONObject.parseObject(role);
        return adminSerivce.updateRole(jsonObject.getString("roleId"), jsonObject.getString("roleName"), jsonObject.getString("userId"));
    }

    @RequestMapping(value = "/deleteRole")
    public String deleteRole(@RequestParam(name = "roleId") String roleId) {
        return adminSerivce.deleteRole(roleId);
    }

    @RequestMapping(value = "/getRoleList")
    public List<DashboardRole> getRoleList() {
        List<DashboardRole> list = roleDao.getRoleList(authenticationService.getCurrentUser().getUserId());
        return list;
    }

    @RequestMapping(value = "/getRoleListAll")
    public List<DashboardRole> getRoleListAll() {
        List<DashboardRole> list = roleDao.getRoleListAll();
        return list;
    }

    @RequestMapping(value = "/updateUserRole")
    public String updateUserRole(@RequestParam(name = "userIdArr") String userIdArr, @RequestParam(name = "roleIdArr") String roleIdArr) {
        return adminSerivce.updateUserRole(
                JSONArray.parseArray(userIdArr).toArray(new String[]{}),
                JSONArray.parseArray(roleIdArr).toArray(new String[]{}),
                authenticationService.getCurrentUser().getUserId()
        );
    }

    @RequestMapping(value = "/deleteUserRole")
    public String deleteUserRole(@RequestParam(name = "userIdArr") String userIdArr, @RequestParam(name = "roleIdArr") String roleIdArr) {
        return adminSerivce.deleteUserRoles(
                JSONArray.parseArray(userIdArr).toArray(new String[]{}),
                JSONArray.parseArray(roleIdArr).toArray(new String[]{}),
                authenticationService.getCurrentUser().getUserId()
        );
    }

    @RequestMapping(value = "/getUserRoleList")
    public List<DashboardUserRole> getUserRoleList() {
        List<DashboardUserRole> list = userDao.getUserRoleList();
        return list;
    }

    @RequestMapping(value = "/getRoleResList")
    public List<ViewDashboardRoleRes> getRoleResList() {
        List<DashboardRoleRes> list = roleDao.getRoleResList();
        return list.stream().map(ViewDashboardRoleRes::new).collect(Collectors.toList());
    }

    @RequestMapping(value = "/updateRoleRes")
    public String updateRoleRes(@RequestParam(name = "roleIdArr") String roleIdArr, @RequestParam(name = "resIdArr") String resIdArr) {
        return adminSerivce.updateRoleRes(JSONArray.parseArray(roleIdArr).toArray(new String[]{}), resIdArr);
    }

    @RequestMapping(value = "/updateRoleResUser")
    public String updateRoleResUser(@RequestParam(name = "roleIdArr") String roleIdArr, @RequestParam(name = "resIdArr") String resIdArr) {
        return adminSerivce.updateRoleResUser(JSONArray.parseArray(roleIdArr).toArray(new String[]{}), resIdArr);
    }

    @RequestMapping(value = "/isAdmin")
    public boolean isAdmin() {
        return adminUserId.equals(authenticationService.getCurrentUser().getUserId());
    }

    @RequestMapping(value = "/isConfig")
    public boolean isConfig(@RequestParam(name = "type") String type) {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return true;
        } else if (type.equals("widget")) {
            List<Long> menuIdList = menuDao.getMenuIdByUserRole(userid);
            if (menuIdList.contains(1L) && menuIdList.contains(4L)) {
                return true;
            }
        }
        return false;
    }

    @RequestMapping(value = "/getDatasetList")
    public List<ViewDashboardDataset> getDatasetList() {
        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardDataset> list = datasetDao.getDatasetListAdmin(userid);
        return Lists.transform(list, ViewDashboardDataset.TO);
    }

    @RequestMapping(value = "/getDatasetListUser")
    public List<ViewDashboardDataset> getDatasetListUser() {
        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardDataset> list = adminSerivce.getDatasetList(userid);
        return Lists.transform(list, ViewDashboardDataset.TO);
    }

    @RequestMapping(value = "/getJobList")
    public List<ViewDashboardJob> getJobList() {
        String userid = authenticationService.getCurrentUser().getUserId();
        return jobDao.getJobListAdmin(userid).stream().map(ViewDashboardJob::new).collect(Collectors.toList());
    }

    @RequestMapping(value = "/getBoardList")
    public List<ViewDashboardBoard> getBoardList() {
        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardBoard> list = boardDao.getBoardListAdmin(userid);
        return Lists.transform(list, ViewDashboardBoard.TO);
    }

    @RequestMapping(value = "/getBoardListUser")
    public List<ViewDashboardBoard> getBoardListUser() {
        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardBoard> list = adminSerivce.getBoardList(userid);
        return Lists.transform(list, ViewDashboardBoard.TO);
    }

    @RequestMapping(value = "/getWidgetList")
    public List<ViewDashboardWidget> getWidgetList() {
        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardWidget> list = widgetDao.getWidgetListAdmin(userid);
        return Lists.transform(list, ViewDashboardWidget.TO);
    }

    @RequestMapping(value = "/getWidgetListUser")
    public List<ViewDashboardWidget> getWidgetListUser() {
        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardWidget> list = adminSerivce.getWidgetList(userid);
        return Lists.transform(list, ViewDashboardWidget.TO);
    }

    @RequestMapping(value = "/getDatasourceList")
    public List<ViewDashboardDatasource> getDatasourceList() {
        String userid = authenticationService.getCurrentUser().getUserId();
        return datasourceService.getViewDatasourceList(() -> datasourceDao.getDatasourceListAdmin(userid));
    }

    @RequestMapping(value = "/getMenuList")
    public List<DashboardMenu> getMenuList() {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (adminUserId.equals(userid)) {
            return menuService.getMenuList();
        } else {
            List<Long> menuId = menuDao.getMenuIdByRoleAdmin(userid);
            return menuService.getMenuList().stream().filter(e -> menuId.stream().anyMatch(id -> id.equals(e.getMenuId()))).collect(Collectors.toList());
        }
    }
}
