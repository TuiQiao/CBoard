package org.cboard.services.role;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Function;
import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.cboard.dao.*;
import org.cboard.pojo.DashboardRole;
import org.cboard.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Repository;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by yfyuan on 2016/12/22.
 */
@Repository
@Aspect
@Order(2)
public class ConfigRuleService {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private MenuDao menuDao;

    @Autowired
    private RoleDao roleDao;

    @Value("${admin_user_id}")
    private String adminUserId;

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private WidgetDao widgetDao;

    @Autowired
    private BoardDao boardDao;

    @Around("execution(* org.cboard.services.WidgetService.save(..)) || " +
            "execution(* org.cboard.services.WidgetService.update(..)) || " +
            "execution(* org.cboard.services.WidgetService.delete(..))")
    public Object widgetRule(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            List<Long> menuIdList = menuDao.getMenuIdByUserRole(userid);
            if (menuIdList.contains(1L) && menuIdList.contains(4L)) {
                return proceedingJoinPoint.proceed();
            }
        }
        return null;
    }

    @Around("execution(* org.cboard.services.DatasetService.save(..)) || " +
            "execution(* org.cboard.services.DatasetService.update(..)) || " +
            "execution(* org.cboard.services.DatasetService.delete(..))")
    public Object datasetRule(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            List<Long> menuIdList = menuDao.getMenuIdByUserRole(userid);
            if (menuIdList.contains(1L) && menuIdList.contains(3L)) {
                return proceedingJoinPoint.proceed();
            }
        }
        return null;
    }

    @Around("execution(* org.cboard.services.DatasourceService.save(..)) || " +
            "execution(* org.cboard.services.DatasourceService.update(..)) || " +
            "execution(* org.cboard.services.DatasourceService.delete(..))")
    public Object datasourceRule(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            List<Long> menuIdList = menuDao.getMenuIdByUserRole(userid);
            if (menuIdList.contains(1L) && menuIdList.contains(2L)) {
                return proceedingJoinPoint.proceed();
            }
        }
        return null;
    }

    @Around("execution(* org.cboard.services.BoardService.save(..)) || " +
            "execution(* org.cboard.services.BoardService.update(..)) || " +
            "execution(* org.cboard.services.BoardService.delete(..))")
    public Object boardRule(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            List<Long> menuIdList = menuDao.getMenuIdByUserRole(userid);
            if (menuIdList.contains(1L) && menuIdList.contains(5L)) {
                return proceedingJoinPoint.proceed();
            }
        }
        return null;
    }

    @Around("execution(* org.cboard.services.CategoryService.save(..)) || " +
            "execution(* org.cboard.services.CategoryService.update(..)) || " +
            "execution(* org.cboard.services.CategoryService.delete(..))")
    public Object categoryRule(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            List<Long> menuIdList = menuDao.getMenuIdByUserRole(userid);
            if (menuIdList.contains(1L) && menuIdList.contains(6L)) {
                return proceedingJoinPoint.proceed();
            }
        }
        return null;
    }

    @Around("execution(* org.cboard.services.AdminSerivce.addUser(..)) || " +
            "execution(* org.cboard.services.AdminSerivce.updateUser(..)))")
    public Object userAdminRule(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        }
        return null;
    }

    @Around("execution(* org.cboard.services.AdminSerivce.addRole(..)) || " +
            "execution(* org.cboard.services.AdminSerivce.updateRole(..)) || " +
            "execution(* org.cboard.services.AdminSerivce.updateRoleRes(..))")
    public Object resAdminRule(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            List<Long> menuIdList = menuDao.getMenuIdByUserRole(userid);
            if (menuIdList.contains(7L) && menuIdList.contains(8L)) {
                return proceedingJoinPoint.proceed();
            }
        }
        return null;
    }

    @Around("execution(* org.cboard.services.AdminSerivce.updateRole(..))")
    public Object updateRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            DashboardRole role = roleDao.getRole((String) proceedingJoinPoint.getArgs()[0]);
            if (userid.equals(role.getUserId())) {
                return proceedingJoinPoint.proceed();
            }
        }
        return null;
    }

    @Around("execution(* org.cboard.services.AdminSerivce.updateUserRole(..)) ||" +
            "execution(* org.cboard.services.AdminSerivce.deleteUserRoles(..))")
    public Object updateUserRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            List<String> roleId = Lists.transform(roleDao.getRoleList(userid), new Function<DashboardRole, String>() {
                @Nullable
                @Override
                public String apply(@Nullable DashboardRole role) {
                    return role.getRoleId();
                }
            });
            Object[] args = proceedingJoinPoint.getArgs();
            String[] argRoleId = (String[]) args[1];
            roleId.retainAll(Arrays.asList(argRoleId));
            args[1] = roleId.toArray(new String[]{});
            return proceedingJoinPoint.proceed(args);
        }
    }

    @Around("execution(* org.cboard.services.AdminSerivce.updateRoleResUser(..))")
    public Object updateRoleResUser(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed(proceedingJoinPoint.getArgs());
        } else {
            Object[] args = proceedingJoinPoint.getArgs();
            JSONArray arr = JSONArray.parseArray(args[1].toString());
            List<Object> filtered = arr.stream().filter(e -> {
                JSONObject jo = (JSONObject) e;
                switch (jo.getString("resType")) {
                    case "widget":
                        return widgetDao.checkWidgetRole(userid, jo.getLong("resId"), RolePermission.PATTERN_READ) > 0;
                    case "dataset":
                        return datasetDao.checkDatasetRole(userid, jo.getLong("resId"), RolePermission.PATTERN_READ) > 0;
                    case "board":
                        return boardDao.checkBoardRole(userid, jo.getLong("resId"), RolePermission.PATTERN_READ) > 0;
                    default:
                        return false;
                }
            }).collect(Collectors.toList());
            args[1] = JSONArray.toJSON(filtered).toString();
            return proceedingJoinPoint.proceed(args);
        }
    }
}
