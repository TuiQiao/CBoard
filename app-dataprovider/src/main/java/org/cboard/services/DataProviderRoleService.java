package org.cboard.services;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.cboard.dao.DatasetDao;
import org.cboard.dao.DatasourceDao;
import org.cboard.pojo.DashboardDataset;
import org.cboard.services.AuthenticationService;
import org.cboard.services.FolderService;
import org.cboard.services.role.RolePermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Repository;

/**
 * Created by yfyuan on 2016/12/23.
 */
@Repository
@Aspect
@Order(2)
public class DataProviderRoleService {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private DatasourceDao datasourceDao;

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private FolderService folderService;

    @Value("${admin_user_id}")
    private String adminUserId;

    @Around("execution(* org.cboard.services.DataProviderService.getDimensionValues(..)) ||" +
            "execution(* org.cboard.services.DataProviderService.getColumns(..)) ||" +
            "execution(* org.cboard.services.DataProviderService.queryAggData(..)) ||" +
            "execution(* org.cboard.services.DataProviderService.viewAggDataQuery(..))")
    public Object query(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        Long datasourceId = (Long) proceedingJoinPoint.getArgs()[0];
        Long datasetId = (Long) proceedingJoinPoint.getArgs()[2];
        String userid = authenticationService.getCurrentUser().getUserId();
        DashboardDataset ds = datasetDao.getDataset(datasetId);
        if (ds != null) {
            if (datasetDao.checkDatasetRole(userid, datasetId, RolePermission.PATTERN_READ) > 0
                    || folderService.checkFolderAuth(userid, ds.getFolderId())) {
                return proceedingJoinPoint.proceed();
            }
        } else {
            if (datasourceDao.checkDatasourceRole(userid, datasourceId, RolePermission.PATTERN_READ) > 0) {
                return proceedingJoinPoint.proceed();
            }
        }
        return null;
    }

}
