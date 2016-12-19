package org.cboard.services.role;

import com.alibaba.fastjson.JSONObject;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.cboard.dao.BoardDao;
import org.cboard.pojo.DashboardBoard;
import org.cboard.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by yfyuan on 2016/12/14.
 */
@Repository
@Aspect
public class BoardRoleService {

    @Autowired
    private BoardDao boardDao;

    @Autowired
    private AuthenticationService authenticationService;

    @Around("execution(* org.cboard.services.BoardService.getBoardData(*))")
    public Object getBoardData(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        Long id = (Long) proceedingJoinPoint.getArgs()[0];
        String userid = authenticationService.getCurrentUser().getUserId();
        if (boardDao.checkBoardRole(userid, id) > 0) {
            Object value = proceedingJoinPoint.proceed();
            return value;
        } else {
            return null;
        }
    }

    @Around("execution(* org.cboard.services.BoardService.update(..))")
    public Object update(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String json = (String) proceedingJoinPoint.getArgs()[1];
        JSONObject jsonObject = JSONObject.parseObject(json);
        String userid = authenticationService.getCurrentUser().getUserId();
        if (boardDao.checkBoardRole(userid, jsonObject.getLong("id")) > 0) {
            Object value = proceedingJoinPoint.proceed();
            return value;
        } else {
            return null;
        }
    }

    @Around("execution(* org.cboard.services.BoardService.delete(..))")
    public Object delete(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        Long id = (Long) proceedingJoinPoint.getArgs()[1];
        String userid = authenticationService.getCurrentUser().getUserId();
        if (boardDao.checkBoardRole(userid, id) > 0) {
            Object value = proceedingJoinPoint.proceed();
            return value;
        } else {
            return null;
        }
    }
}
