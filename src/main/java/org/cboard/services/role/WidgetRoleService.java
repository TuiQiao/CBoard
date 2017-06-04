package org.cboard.services.role;

import com.alibaba.fastjson.JSONObject;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.cboard.dao.BoardDao;
import org.cboard.dao.WidgetDao;
import org.cboard.services.AuthenticationService;
import org.cboard.services.ServiceStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

/**
 * Created by yfyuan on 2016/12/14.
 */
@Repository
@Aspect
public class WidgetRoleService {

    @Autowired
    private WidgetDao widgetDao;

    @Autowired
    private AuthenticationService authenticationService;

    @Around("execution(* org.cboard.services.WidgetService.update(..))")
    public Object update(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String json = (String) proceedingJoinPoint.getArgs()[1];
        JSONObject jsonObject = JSONObject.parseObject(json);
        String userid = authenticationService.getCurrentUser().getUserId();
        if (widgetDao.checkWidgetRole(userid, jsonObject.getLong("id"), RolePermission.PATTERN_EDIT) > 0) {
            Object value = proceedingJoinPoint.proceed();
            return value;
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "No Permission");
        }
    }

    @Around("execution(* org.cboard.services.WidgetService.delete(..))")
    public Object delete(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        Long id = (Long) proceedingJoinPoint.getArgs()[1];
        String userid = authenticationService.getCurrentUser().getUserId();
        if (widgetDao.checkWidgetRole(userid, id, RolePermission.PATTERN_DELETE) > 0) {
            Object value = proceedingJoinPoint.proceed();
            return value;
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "No Permission");
        }
    }
}
