package org.cboard.services.role;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.cboard.dao.MenuDao;
import org.cboard.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by yfyuan on 2016/12/22.
 */
@Repository
@Aspect
@Order(2)
public class ConfigRoleService {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private MenuDao menuDao;

    @Value("${admin_user_id}")
    private String adminUserId;

    @Around("execution(* org.cboard.services.WidgetService.save(..)) || " +
            "execution(* org.cboard.services.WidgetService.update(..)) || " +
            "execution(* org.cboard.services.WidgetService.delete(..))")
    public Object widgetRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
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
    public Object datasetRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
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
    public Object datasourceRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
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
    public Object boardRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
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
    public Object categoryRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
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
            "execution(* org.cboard.services.AdminSerivce.updateUser(..)) || " +
            "execution(* org.cboard.services.AdminSerivce.addRole(..)) || " +
            "execution(* org.cboard.services.AdminSerivce.updateRole(..)) || " +
            "execution(* org.cboard.services.AdminSerivce.updateUserRole(..))")
    public Object userAdminRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        }
        return null;
    }

    @Around("execution(* org.cboard.services.AdminSerivce.updateRoleRes(..))")
    public Object resAdminRole(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
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
}
