package org.cboard.services.role;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.cboard.dao.BoardDao;
import org.cboard.dao.DatasetDao;
import org.cboard.dao.DatasourceDao;
import org.cboard.dao.WidgetDao;
import org.cboard.dto.ViewDashboardBoard;
import org.cboard.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
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
    private WidgetDao widgetDao;

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private DatasourceDao datasourceDao;

    @Autowired
    private AuthenticationService authenticationService;

    @Around("execution(* org.cboard.services.BoardService.getBoardData(*))")
    public Object getBoardData(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        Long id = (Long) proceedingJoinPoint.getArgs()[0];
        String userid = authenticationService.getCurrentUser().getUserId();
        if (boardDao.checkBoardRole(userid, id) > 0) {
            ViewDashboardBoard value = (ViewDashboardBoard) proceedingJoinPoint.proceed();
            JSONArray rows = (JSONArray) value.getLayout().get("rows");
            for (Object row : rows) {
                JSONArray widgets = ((JSONObject) row).getJSONArray("widgets");
                for (Object widget : widgets) {
                    JSONObject vw = ((JSONObject) widget).getJSONObject("widget");
                    Long widgetId = vw.getLong("id");
                    Long datasetId = vw.getJSONObject("data").getLong("datasetId");
                    Long datasourceId = vw.getJSONObject("data").getLong("datasource");
                    List<Res> roleInfo = new ArrayList<>();
                    if (widgetDao.checkWidgetRole(userid, widgetId) <= 0) {
                        ((JSONObject) widget).put("hasRole", false);
                        roleInfo.add(new Res("ADMIN.WIDGET", vw.getString("name")));
                    }
                    if (datasetId != null && datasetDao.checkDatasetRole(userid, datasetId) <= 0) {
                        ((JSONObject) widget).put("hasRole", false);
                        roleInfo.add(new Res("ADMIN.DATASET", datasetDao.getDataset(datasetId).getName()));
                    }
                    if (datasourceId != null && datasourceDao.checkDatasourceRole(userid, datasourceId) <= 0) {
                        ((JSONObject) widget).put("hasRole", false);
                        roleInfo.add(new Res("ADMIN.DATASOURCE", datasourceDao.getDatasource(datasourceId).getName()));
                    }
                    ((JSONObject) widget).put("roleInfo", roleInfo);
                }
            }
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

    private class Res {
        private String type;
        private String name;

        public Res(String type, String name) {
            this.type = type;
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
