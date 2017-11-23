package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.cboard.dao.BoardDao;
import org.cboard.dao.DatasetDao;
import org.cboard.dao.FolderDao;
import org.cboard.dao.WidgetDao;
import org.cboard.pojo.DashboardBoard;
import org.cboard.pojo.DashboardDataset;
import org.cboard.pojo.DashboardFolder;
import org.cboard.pojo.DashboardWidget;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by jx_luo on 2017/10/13.
 */
@Repository
public class FolderService {
    @Autowired
    private FolderDao folderDao;
    @Autowired
    private DatasetDao datasetDao;
    @Autowired
    private WidgetDao widgetDao;
    @Autowired
    private BoardDao boardDao;

    public ServiceStatus save(String userId, String json){
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardFolder folder = new DashboardFolder();
        folder.setName(jsonObject.getString("name"));
        folder.setParentId(jsonObject.getInteger("parentId"));

        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("folder_name", folder.getName());
        paramMap.put("parent_id", folder.getParentId());
        if (folderDao.countExistFolderName(paramMap) <= 0) {
            folderDao.save(folder);
            return new ServiceStatus(ServiceStatus.Status.Success, "success", new Long(folder.getId()));
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "Duplicated name");
        }
    }

    public ServiceStatus update(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardFolder folder = new DashboardFolder();
        folder.setId(jsonObject.getInteger("id"));
        folder.setName(jsonObject.getString("name"));
        folder.setParentId(jsonObject.getInteger("parentId"));
        folder.setUpdateTime(new Timestamp(Calendar.getInstance().getTimeInMillis()));

        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("folder_name", folder.getName());
        paramMap.put("parent_id", folder.getParentId());
        if (folderDao.countExistFolderName(paramMap) <= 0) {
            folderDao.update(folder);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } else {
            return new ServiceStatus(ServiceStatus.Status.Fail, "Duplicated name");
        }
    }

    public ServiceStatus delete(int id) {
        DashboardFolder folder = folderDao.getFolderById(id);
        List<DashboardDataset> ds = datasetDao.getAllDatasetList();
        List<DashboardWidget> widgt = widgetDao.getAllWidgetList();
        List<DashboardBoard> board = boardDao.getBoardListAdmin("amdin");

        long cntDs = ds.stream().filter(s -> s.getFolderId() == id).count();
        long cntWg = widgt.stream().filter(w -> w.getFolderId() == id).count();
        long cntBd = board.stream().filter(b -> b.getFolderId() == id).count();

        if (cntDs > 0 || cntWg > 0 || cntBd > 0){
            return new ServiceStatus(ServiceStatus.Status.Fail, folder.getName() + " : There is " + cntDs + " DataSets and " + cntWg + " Widgets and  " + cntBd + " Boards in the folders");
        } else {
            folderDao.delete(id);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        }
    }
}
