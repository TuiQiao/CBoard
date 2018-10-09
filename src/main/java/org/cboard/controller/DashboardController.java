package org.cboard.controller;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.base.Functions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.hash.Hashing;
import org.apache.commons.io.IOUtils;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by yfyuan on 2016/8/9.
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController extends BaseController {

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
        return datasourceService.getViewDatasourceList(() -> datasourceDao.getDatasourceList(tlUser.get().getUserId()));
    }

    @RequestMapping(value = "/getProviderList")
    public Set<String> getProviderList() {
        return DataProviderManager.getProviderList();
    }

    @RequestMapping(value = "/getConfigParams")
    public List<Map<String, Object>> getConfigParams(@RequestParam(name = "type") String type,
                                                     @RequestParam(name = "page") String page,
                                                     @RequestParam(name = "datasourceId", required = false) Long datasourceId) {
        Map<String, String> dataSource = null;
        if (datasourceId != null) {
            dataSource = dataProviderService.getDataSource(datasourceId);
        }
        return DataProviderViewManager.getQueryParams(type, page, dataSource);
    }

    @RequestMapping(value = "/getConfigView")
    public String getConfigView(@RequestParam(name = "type") String type,
                                @RequestParam(name = "page") String page,
                                @RequestParam(name = "datasourceId", required = false) Long datasourceId) {
        Map<String, String> dataSource = null;
        if (datasourceId != null) {
            dataSource = dataProviderService.getDataSource(datasourceId);
        }
        return DataProviderViewManager.getQueryView(type, page, dataSource);
    }

    @RequestMapping(value = "/getDatasourceParams")
    public List<Map<String, Object>> getDatasourceParams(@RequestParam(name = "type") String type) {
        return DataProviderViewManager.getDatasourceParams(type);
    }

    @RequestMapping(value = "/getDatasourceView")
    public String getDatasourceView(@RequestParam(name = "type") String type) {
        return DataProviderViewManager.getDatasourceView(type);
    }

    @RequestMapping(value = "/saveNewDatasource")
    public ServiceStatus saveNewDatasource(@RequestParam(name = "json") String json) {
        return datasourceService.save(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/updateDatasource")
    public ServiceStatus updateDatasource(@RequestParam(name = "json") String json) {
        return datasourceService.update(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/deleteDatasource")
    public ServiceStatus deleteDatasource(@RequestParam(name = "id") Long id) {
        return datasourceService.delete(tlUser.get().getUserId(), id);
    }

    @RequestMapping(value = "/saveNewWidget")
    public ServiceStatus saveNewWidget(@RequestParam(name = "json") String json) {
        return widgetService.save(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/getAllWidgetList")
    public List<ViewDashboardWidget> getAllWidgetList() {
        List<DashboardWidget> list = widgetDao.getAllWidgetList();
        return Lists.transform(list, ViewDashboardWidget.TO);
    }

    @RequestMapping(value = "/getWidgetList")
    public List<ViewDashboardWidget> getWidgetList() {
        List<DashboardWidget> list = widgetDao.getWidgetList(tlUser.get().getUserId());
        return Lists.transform(list, ViewDashboardWidget.TO);
    }

    @RequestMapping(value = "/updateWidget")
    public ServiceStatus updateWidget(@RequestParam(name = "json") String json) {
        return widgetService.update(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/deleteWidget")
    public ServiceStatus deleteWidget(@RequestParam(name = "id") Long id) {
        return widgetService.delete(tlUser.get().getUserId(), id);
    }

    @RequestMapping(value = "/getBoardList")
    public List<ViewDashboardBoard> getBoardList() {
        List<DashboardBoard> list = boardService.getBoardList(tlUser.get().getUserId());
        return Lists.transform(list, ViewDashboardBoard.TO);
    }

    @RequestMapping(value = "/saveNewBoard")
    public ServiceStatus saveNewBoard(@RequestParam(name = "json") String json) {
        return boardService.save(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/updateBoard")
    public ServiceStatus updateBoard(@RequestParam(name = "json") String json) {
        return boardService.update(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/deleteBoard")
    public ServiceStatus deleteBoard(@RequestParam(name = "id") Long id) {
        return boardService.delete(tlUser.get().getUserId(), id);
    }

    @RequestMapping(value = "/getBoardData")
    public ViewDashboardBoard getBoardData(@RequestParam(name = "id") Long id) {
        return boardService.getBoardData(id);
    }

    @RequestMapping(value = "/saveNewCategory")
    public ServiceStatus saveNewCategory(@RequestParam(name = "json") String json) {
        return categoryService.save(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/getCategoryList")
    public List<DashboardCategory> getCategoryList() {
        List<DashboardCategory> list = categoryDao.getCategoryList();
        return list;
    }

    @RequestMapping(value = "/updateCategory")
    public ServiceStatus updateCategory(@RequestParam(name = "json") String json) {
        return categoryService.update(tlUser.get().getUserId(), json);
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
        return datasetService.save(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/getAllDatasetList")
    public List<ViewDashboardDataset> getAllDatasetList() {
        List<DashboardDataset> list = datasetDao.getAllDatasetList();
        return Lists.transform(list, ViewDashboardDataset.TO);
    }

    @RequestMapping(value = "/getDatasetList")
    public List<ViewDashboardDataset> getDatasetList() {
        List<DashboardDataset> list = datasetDao.getDatasetList(tlUser.get().getUserId());
        return Lists.transform(list, ViewDashboardDataset.TO);
    }

    @RequestMapping(value = "/updateDataset")
    public ServiceStatus updateDataset(@RequestParam(name = "json") String json) {
        return datasetService.update(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/deleteDataset")
    public ServiceStatus deleteDataset(@RequestParam(name = "id") Long id) {
        return datasetService.delete(tlUser.get().getUserId(), id);
    }

    @RequestMapping(value = "/getDatasetCategoryList")
    public List<String> getDatasetCategoryList() {
        return datasetDao.getCategoryList();
    }

    @RequestMapping(value = "/checkWidget")
    public ServiceStatus checkWidget(@RequestParam(name = "id") Long id) {
        return widgetService.checkRule(tlUser.get().getUserId(), id);
    }

    @RequestMapping(value = "/checkDatasource")
    public ServiceStatus checkDatasource(@RequestParam(name = "id") Long id) {
        return datasourceService.checkDatasource(tlUser.get().getUserId(), id);
    }

    @RequestMapping(value = "/getDimensionValues")
    public String[] getDimensionValues(@RequestParam(name = "datasourceId", required = false) Long datasourceId,
                                       @RequestParam(name = "query", required = false) String query,
                                       @RequestParam(name = "datasetId", required = false) Long datasetId,
                                       @RequestParam(name = "colmunName", required = true) String colmunName,
                                       @RequestParam(name = "cfg", required = false) String cfg,
                                       @RequestParam(name = "reload", required = false, defaultValue = "false") Boolean reload) {
        Map<String, String> strParams = null;
        if (query != null) {
            JSONObject queryO = JSONObject.parseObject(query);
            strParams = Maps.transformValues(queryO, Functions.toStringFunction());
        }
        AggConfig config = null;
        if (cfg != null) {
            config = ViewAggConfig.getAggConfig(JSONObject.parseObject(cfg, ViewAggConfig.class));
        }
        return dataProviderService.getDimensionValues(datasourceId, strParams, datasetId, colmunName, config, reload);
    }

    @RequestMapping(value = "/getColumns")
    public DataProviderResult getColumns(@RequestParam(name = "datasourceId", required = false) Long datasourceId,
                                         @RequestParam(name = "query", required = false) String query,
                                         @RequestParam(name = "datasetId", required = false) Long datasetId,
                                         @RequestParam(name = "reload", required = false, defaultValue = "false") Boolean reload) {
        Map<String, String> strParams = null;
        if (query != null) {
            JSONObject queryO = JSONObject.parseObject(query);
            strParams = Maps.transformValues(queryO, Functions.toStringFunction());
        }
        return dataProviderService.getColumns(datasourceId, strParams, datasetId, reload);
    }

    @RequestMapping(value = "/getAggregateData")
    public AggregateResult getAggregateData(@RequestParam(name = "datasourceId", required = false) Long datasourceId,
                                            @RequestParam(name = "query", required = false) String query,
                                            @RequestParam(name = "datasetId", required = false) Long datasetId,
                                            @RequestParam(name = "cfg") String cfg,
                                            @RequestParam(name = "reload", required = false, defaultValue = "false") Boolean reload) {
        Map<String, String> strParams = null;
        if (query != null) {
            JSONObject queryO = JSONObject.parseObject(query);
            strParams = Maps.transformValues(queryO, Functions.toStringFunction());
        }
        AggregateResult aggResult = null;
        // data source aggreagtor instance need not lock
        boolean isDataSourceAggInstance = dataProviderService.isDataSourceAggInstance(datasourceId, strParams, datasetId);
        String randomFlag = isDataSourceAggInstance ? UUID.randomUUID().toString() : "1";
        String lockString = Hashing.md5().newHasher()
                .putString(datasourceId + query + datasetId + tlUser.get().getUserId() + randomFlag, Charsets.UTF_8)
                .hash().toString();
        synchronized (lockString.intern()) {
            AggConfig config = ViewAggConfig.getAggConfig(JSONObject.parseObject(cfg, ViewAggConfig.class));
            aggResult = dataProviderService.queryAggData(datasourceId, strParams, datasetId, config, reload);
        }
        return aggResult;
    }

    @RequestMapping(value = "/viewAggDataQuery")
    public String[] viewAggDataQuery(@RequestParam(name = "datasourceId", required = false) Long datasourceId,
                                     @RequestParam(name = "query", required = false) String query,
                                     @RequestParam(name = "datasetId", required = false) Long datasetId,
                                     @RequestParam(name = "cfg") String cfg) {
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
        return jobService.save(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/updateJob")
    public ServiceStatus updateJob(@RequestParam(name = "json") String json) {
        return jobService.update(tlUser.get().getUserId(), json);
    }

    @RequestMapping(value = "/getJobList")
    public List<ViewDashboardJob> getJobList() {
        return jobDao.getJobList(tlUser.get().getUserId()).stream().map(ViewDashboardJob::new).collect(Collectors.toList());
    }

    @RequestMapping(value = "/deleteJob")
    public ServiceStatus deleteJob(@RequestParam(name = "id") Long id) {
        return jobService.delete(tlUser.get().getUserId(), id);
    }

    @RequestMapping(value = "/execJob")
    public ServiceStatus execJob(@RequestParam(name = "id") Long id) {
        return jobService.exec(tlUser.get().getUserId(), id);
    }

    @RequestMapping(value = "/exportBoard")
    public ResponseEntity<byte[]> exportBoard(@RequestParam(name = "id") Long id) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "report.xls");
        return new ResponseEntity<>(boardService.exportBoard(id, tlUser.get().getUserId()), headers, HttpStatus.CREATED);
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
            LOG.error("", e);
        }
        return null;
    }

    @RequestMapping(value = "/getJobStatus")
    public ViewDashboardJob getJobStatus(@RequestParam(name = "id") Long id) {
        return new ViewDashboardJob(jobDao.getJob(id));
    }

    @RequestMapping(value = "/getBoardParam")
    public DashboardBoardParam getBoardParam(@RequestParam(name = "boardId") Long boardId) {
        return boardDao.getBoardParam(boardId, tlUser.get().getUserId());
    }

    @RequestMapping(value = "/saveBoardParam")
    @Transactional
    public String saveBoardParam(@RequestParam(name = "boardId") Long boardId,
                                 @RequestParam(name = "config") String config) {
        if (boardId == null) {
            return "";
        }
        DashboardBoardParam boardParam = new DashboardBoardParam();
        boardParam.setBoardId(boardId);
        boardParam.setUserId(tlUser.get().getUserId());
        boardParam.setConfig(config);
        boardDao.deleteBoardParam(boardId, tlUser.get().getUserId());
        boardDao.saveBoardParam(boardParam);
        return "1";
    }

    @ExceptionHandler
    public ServiceStatus exp(HttpServletResponse response, Exception ex) {
        response.setStatus(500);
        LOG.error("Gloal exception Handler", ex);
        return new ServiceStatus(ServiceStatus.Status.Fail, ex.getMessage());
    }

    @RequestMapping(value = "/uploadImage")
    public String uploadImage(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        String imgPath = imgPath(request);
        String fileName = file.getOriginalFilename();
        String tempFile = tempDir(imgPath) + fileName;
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(tempFile);
            fos.write(file.getBytes());
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            IOUtils.closeQuietly(fos);
        }
        return tempFile.split(imgPath)[1];
    }

    private String imgPath(HttpServletRequest request) {
        String templateDir = request.getSession().getServletContext().getRealPath("/");
        templateDir = templateDir.replace("\\","/");
        templateDir = templateDir + "imgs/cockpit";
        return templateDir;
    }

    private String tempDir(String templateDir) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String timestamp = sdf.format(new Date());
        templateDir = templateDir + "/upload/" + timestamp + "/";
        File file = new File(templateDir);
        if (!file.exists()) {
            file.mkdirs();
        }
        return templateDir;
    }
}
