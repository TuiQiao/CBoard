package org.cboard.services.role;

import com.alibaba.fastjson.JSONObject;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.cboard.dao.DatasetDao;
import org.cboard.dao.RoleDao;
import org.cboard.pojo.DashboardDataset;
import org.cboard.services.AuthenticationService;
import org.cboard.services.FolderService;
import org.cboard.services.ServiceStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

/**
 * Created by yfyuan on 2016/12/14.
 */
@Repository
@Aspect
public class DatasetRoleService {

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private FolderService folderService;

    @Autowired
    private AuthenticationService authenticationService;

    @Around("execution(* org.cboard.services.DatasetService.update(..))")
    public Object update(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String json = (String) proceedingJoinPoint.getArgs()[1];
        JSONObject jsonObject = JSONObject.parseObject(json);
        String userid = authenticationService.getCurrentUser().getUserId();
        if (datasetDao.checkDatasetRole(userid, jsonObject.getLong("id"), RolePermission.PATTERN_EDIT) > 0
                || folderService.checkFolderAuth(userid, jsonObject.getInteger("folderId"))) {
            Object value = proceedingJoinPoint.proceed();
            return value;
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "No Permission");
        }
    }

    @Around("execution(* org.cboard.services.DatasetService.delete(..))")
    public Object delete(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        Long id = (Long) proceedingJoinPoint.getArgs()[1];
        String userid = authenticationService.getCurrentUser().getUserId();
        DashboardDataset ds = datasetDao.getDataset(id);
        int folderId = 0;
        if (ds != null){
            folderId = ds.getFolderId();
        }
        if (datasetDao.checkDatasetRole(userid, id, RolePermission.PATTERN_DELETE) > 0
                || folderService.checkFolderAuth(userid, folderId)) {
            Object value = proceedingJoinPoint.proceed();
            return value;
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "No Permission");
        }
    }
}
