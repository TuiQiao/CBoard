package org.cboard.controller;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Functions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.cboard.dao.*;
import org.cboard.dataprovider.DataProviderManager;
import org.cboard.dataprovider.DataProviderViewManager;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.result.AggregateResult;
import org.cboard.dto.*;
import org.cboard.pojo.*;
import org.cboard.services.*;
import org.cboard.services.job.JobService;
import org.cboard.services.persist.excel.XlsProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created by yfyuan on 2016/8/9.
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private BoardDao boardDao;

    @Autowired
    private DatasourceDao datasourceDao;

    @Autowired
    private DataProviderService dataProviderService;

    @Autowired
    private DatasourceService datasourceService;

    @Autowired
    private WidgetService widgetService;

    @Autowired
    private WidgetDao widgetDao;

    @Autowired
    private BoardService boardService;

    @Autowired
    private CategoryDao categoryDao;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private DatasetService datasetService;

    @Autowired
    private JobService jobService;

    @Autowired
    private JobDao jobDao;

    @Autowired
    private XlsProcessService xlsProcessService;

    @RequestMapping(value = "/test")
    public ServiceStatus test(@RequestParam(name = "datasource", required = false) String datasource, @RequestParam(name = "query", required = false) String query) {
        JSONObject queryO = JSONObject.parseObject(query);
        JSONObject datasourceO = JSONObject.parseObject(datasource);
        return dataProviderService.test(datasourceO, Maps.transformValues(queryO, Functions.toStringFunction()));
    }

    @RequestMapping(value = "/getDatasourceList")
    public List<ViewDashboardDatasource> getDatasourceList() {

        String userid = authenticationService.getCurrentUser().getUserId();

        List<DashboardDatasource> list = datasourceDao.getDatasourceList(userid);
        return Lists.transform(list, ViewDashboardDatasource.TO);
    }

    @RequestMapping(value = "/getProviderList")
    public Set<String> getProviderList() {
        return DataProviderManager.getProviderList();
    }

    @RequestMapping(value = "/getConfigView")
    public String getConfigView(@RequestParam(name = "type") String type) {
        return DataProviderViewManager.getQueryView(type);
    }

    @RequestMapping(value = "/getDatasourceView")
    public String getDatasourceView(@RequestParam(name = "type") String type) {
        return DataProviderViewManager.getDatasourceView(type);
    }

    @RequestMapping(value = "/saveNewDatasource")
    public ServiceStatus saveNewDatasource(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return datasourceService.save(userid, json);
    }

    @RequestMapping(value = "/updateDatasource")
    public ServiceStatus updateDatasource(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return datasourceService.update(userid, json);
    }

    @RequestMapping(value = "/deleteDatasource")
    public ServiceStatus deleteDatasource(@RequestParam(name = "id") Long id) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return datasourceService.delete(userid, id);
    }

    @RequestMapping(value = "/saveNewWidget")
    public ServiceStatus saveNewWidget(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return widgetService.save(userid, json);
    }

    @RequestMapping(value = "/getAllWidgetList")
    public List<ViewDashboardWidget> getAllWidgetList() {
        List<DashboardWidget> list = widgetDao.getAllWidgetList();
        return Lists.transform(list, ViewDashboardWidget.TO);
    }

    @RequestMapping(value = "/getWidgetList")
    public List<ViewDashboardWidget> getWidgetList() {

        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardWidget> list = widgetDao.getWidgetList(userid);
        return Lists.transform(list, ViewDashboardWidget.TO);
    }

    @RequestMapping(value = "/updateWidget")
    public ServiceStatus updateWidget(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return widgetService.update(userid, json);
    }

    @RequestMapping(value = "/deleteWidget")
    public ServiceStatus deleteWidget(@RequestParam(name = "id") Long id) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return widgetService.delete(userid, id);
    }

    @RequestMapping(value = "/getBoardList")
    public List<ViewDashboardBoard> getBoardList() {

        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardBoard> list = boardService.getBoardList(userid);
        return Lists.transform(list, ViewDashboardBoard.TO);
    }

    @RequestMapping(value = "/saveNewBoard")
    public ServiceStatus saveNewBoard(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return boardService.save(userid, json);
    }

    @RequestMapping(value = "/updateBoard")
    public ServiceStatus updateBoard(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return boardService.update(userid, json);
    }

    @RequestMapping(value = "/deleteBoard")
    public ServiceStatus deleteBoard(@RequestParam(name = "id") Long id) {
        String userid = authenticationService.getCurrentUser().getUserId();
        return boardService.delete(userid, id);
    }

    @RequestMapping(value = "/getBoardData")
    public ViewDashboardBoard getBoardData(@RequestParam(name = "id") Long id) {
        return boardService.getBoardData(id);
    }

    @RequestMapping(value = "/saveNewCategory")
    public ServiceStatus saveNewCategory(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return categoryService.save(userid, json);
    }

    @RequestMapping(value = "/getCategoryList")
    public List<DashboardCategory> getCategoryList() {
        List<DashboardCategory> list = categoryDao.getCategoryList();
        return list;
    }

    @RequestMapping(value = "/updateCategory")
    public ServiceStatus updateCategory(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return categoryService.update(userid, json);
    }

    @RequestMapping(value = "/deleteCategory")
    public String deleteCategory(@RequestParam(name = "id") Long id) {
        return categoryService.delete(id);
    }

    @RequestMapping(value = "/getWidgetCategoryList")
    public List<String> getWidgetCategoryList() {
        return widgetDao.getCategoryList();
    }

    @RequestMapping(value = "/saveNewDataset")
    public ServiceStatus saveNewDataset(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return datasetService.save(userid, json);
    }

    @RequestMapping(value = "/getAllDatasetList")
    public List<ViewDashboardDataset> getAllDatasetList() {
        List<DashboardDataset> list = datasetDao.getAllDatasetList();
        return Lists.transform(list, ViewDashboardDataset.TO);
    }

    @RequestMapping(value = "/getDatasetList")
    public List<ViewDashboardDataset> getDatasetList() {

        String userid = authenticationService.getCurrentUser().getUserId();
        List<DashboardDataset> list = datasetDao.getDatasetList(userid);
        return Lists.transform(list, ViewDashboardDataset.TO);
    }

    @RequestMapping(value = "/updateDataset")
    public ServiceStatus updateDataset(@RequestParam(name = "json") String json) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return datasetService.update(userid, json);
    }

    @RequestMapping(value = "/deleteDataset")
    public ServiceStatus deleteDataset(@RequestParam(name = "id") Long id) {

        String userid = authenticationService.getCurrentUser().getUserId();
        return datasetService.delete(userid, id);
    }

    @RequestMapping(value = "/getDatasetCategoryList")
    public List<String> getDatasetCategoryList() {
        return datasetDao.getCategoryList();
    }

    @RequestMapping(value = "/checkWidget")
    public ServiceStatus checkWidget(@RequestParam(name = "id") Long id) {
        return widgetService.checkRule(authenticationService.getCurrentUser().getUserId(), id);
    }

    @RequestMapping(value = "/checkDatasource")
    public ServiceStatus checkDatasource(@RequestParam(name = "id") Long id) {
        return datasourceService.checkDatasource(authenticationService.getCurrentUser().getUserId(), id);
    }

    @RequestMapping(value = "/getDimensionValues")
    public String[][] getDimensionValues(@RequestParam(name = "datasourceId", required = false) Long datasourceId, @RequestParam(name = "query", required = false) String query, @RequestParam(name = "datasetId", required = false) Long datasetId, @RequestParam(name = "colmunName", required = true) String colmunName, @RequestParam(name = "cfg", required = false) String cfg, @RequestParam(name = "reload", required = false, defaultValue = "false") Boolean reload) {
        Map<String, String> strParams = null;
        if (query != null) {
            JSONObject queryO = JSONObject.parseObject(query);
            strParams = Maps.transformValues(queryO, Functions.toStringFunction());
        }
        AggConfig config = ViewAggConfig.getAggConfig(JSONObject.parseObject(cfg, ViewAggConfig.class));
        return dataProviderService.getDimensionValues(datasourceId, strParams, datasetId, colmunName, config, reload);
    }

    @RequestMapping(value = "/getColumns")
    public DataProviderResult getColumns(@RequestParam(name = "datasourceId", required = false) Long datasourceId,
                                         @RequestParam(name = "query", required = false) String query,
                                         @RequestParam(name = "datasetId", required = false) Long datasetId, @RequestParam(name = "reload", required = false, defaultValue = "false") Boolean reload) {
        Map<String, String> strParams = null;
        if (query != null) {
            JSONObject queryO = JSONObject.parseObject(query);
            strParams = Maps.transformValues(queryO, Functions.toStringFunction());
        }
        return dataProviderService.getColumns(datasourceId, strParams, datasetId, reload);
    }

    @RequestMapping(value = "/getAggregateData")
    public AggregateResult getAggregateData(@RequestParam(name = "datasourceId", required = false) Long datasourceId, @RequestParam(name = "query", required = false) String query, @RequestParam(name = "datasetId", required = false) Long datasetId, @RequestParam(name = "cfg") String cfg, @RequestParam(name = "reload", required = false, defaultValue = "false") Boolean reload) {
        Map<String, String> strParams = null;
        if (query != null) {
            JSONObject queryO = JSONObject.parseObject(query);
            strParams = Maps.transformValues(queryO, Functions.toStringFunction());
        }
        AggConfig config = ViewAggConfig.getAggConfig(JSONObject.parseObject(cfg, ViewAggConfig.class));
        return dataProviderService.queryAggData(datasourceId, strParams, datasetId, config, reload);
    }

    @RequestMapping(value = "/viewAggDataQuery")
    public String[] viewAggDataQuery(@RequestParam(name = "datasourceId", required = false) Long datasourceId, @RequestParam(name = "query", required = false) String query, @RequestParam(name = "datasetId", required = false) Long datasetId, @RequestParam(name = "cfg") String cfg) {
        Map<String, String> strParams = null;
        if (query != null) {
            JSONObject queryO = JSONObject.parseObject(query);
            strParams = Maps.transformValues(queryO, Functions.toStringFunction());
        }
        AggConfig config = ViewAggConfig.getAggConfig(JSONObject.parseObject(cfg, ViewAggConfig.class));
        return new String[]{dataProviderService.viewAggDataQuery(datasourceId, strParams, datasetId, config)};
    }

    @RequestMapping(value = "/dashboardWidget")
    public ViewDashboardWidget dashboardWidget(@RequestParam(name = "id") Long id) {
        DashboardWidget widget = widgetDao.getWidget(id);
        return new ViewDashboardWidget(widget);
    }

    @RequestMapping(value = "/saveJob")
    public ServiceStatus saveJob(@RequestParam(name = "json") String json) {
        String userid = authenticationService.getCurrentUser().getUserId();
        return jobService.save(userid, json);
    }

    @RequestMapping(value = "/updateJob")
    public ServiceStatus updateJob(@RequestParam(name = "json") String json) {
        String userid = authenticationService.getCurrentUser().getUserId();
        return jobService.update(userid, json);
    }

    @RequestMapping(value = "/getJobList")
    public List<ViewDashboardJob> getJobList() {
        String userid = authenticationService.getCurrentUser().getUserId();
        return jobDao.getJobList(userid).stream().map(ViewDashboardJob::new).collect(Collectors.toList());
    }

    @RequestMapping(value = "/deleteJob")
    public ServiceStatus deleteJob(@RequestParam(name = "id") Long id) {
        String userid = authenticationService.getCurrentUser().getUserId();
        return jobService.delete(userid, id);
    }

    @RequestMapping(value = "/execJob")
    public ServiceStatus execJob(@RequestParam(name = "id") Long id) {
        String userid = authenticationService.getCurrentUser().getUserId();
        return jobService.exec(userid, id);
    }

    @RequestMapping(value = "/exportBoard")
    public ResponseEntity<byte[]> exportBoard(@RequestParam(name = "id") Long id) {
        String userid = authenticationService.getCurrentUser().getUserId();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "report.xls");
        return new ResponseEntity<>(boardService.exportBoard(id, userid), headers, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/tableToxls")
    public ResponseEntity<byte[]> tableToxls(@RequestParam(name = "data") String data) {
        HSSFWorkbook wb = xlsProcessService.tableToxls(JSONObject.parseObject(data));
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            wb.write(out);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "table.xls");
            return new ResponseEntity<>(out.toByteArray(), headers, HttpStatus.CREATED);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    @RequestMapping(value = "/getJobStatus")
    public ViewDashboardJob getJobStatus(@RequestParam(name = "id") Long id) {
        return new ViewDashboardJob(jobDao.getJob(id));
    }

    @ExceptionHandler
    public ServiceStatus exp(HttpServletResponse response, Exception ex) {
        response.setStatus(500);
        return new ServiceStatus(ServiceStatus.Status.Fail, ex.getMessage());
    }
}
