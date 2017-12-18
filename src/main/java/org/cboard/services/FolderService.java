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
import java.util.*;
import java.util.stream.Collectors;

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
    @Autowired
    private RoleService roleService;
    @Autowired
    private AuthenticationService authenticationService;

    public ServiceStatus save(String userId, String json){
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardFolder folder = new DashboardFolder();
        folder.setName(jsonObject.getString("name"));
        folder.setParentId(jsonObject.getInteger("parentId"));
        folder.setIsPrivate(0);
        folder.setUserId(userId);

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

    public String getFolderPath(int folderId){
        String ret = "";
        Set<Integer> folderIds = new HashSet<>();
        folderIds.add(folderId);

        Set<DashboardFolder> folders = getAncestry(folderIds);

        for (DashboardFolder f : folders){
            ret += "\\" + f.getName();
        }

        return ret.length() > 0 ? ret.substring(1) : ret;
    }

    public Set<DashboardFolder> getFolderFamilyTree(Set<Integer> folderIds){
        //get folders descendant
        Set<DashboardFolder> ret = getFolderDescendant(folderIds);

        ret.addAll(getAncestry(folderIds));

        return ret;
    }

    public Set<DashboardFolder> getAncestry(Set<Integer> folderIds){
        Set<DashboardFolder> ret = new HashSet<>();

        List<DashboardFolder> folders = folderDao.getAllFolderList();
        for (int folderId : folderIds) {
            //get Ancestry
            //Root.parentId == -1
            while (folderId != -1) {
                for (DashboardFolder f : folders) {
                    if (f.getId() == folderId) {
                        ret.add(f);
                        folderId = f.getParentId();
                        break;
                    }
                }
            }
        }
        return ret;
    }

    public Set<DashboardFolder> getFolderDescendant(Set<Integer> folderIds){
        Set<DashboardFolder> ret = new HashSet<>();

        if (folderIds == null || folderIds.size() == 0){
            return ret;
        }

        List<DashboardFolder> folders = folderDao.getAllFolderList();

        for (int folderId : folderIds) {
            int parentId = folderId;

            //get itself
            ret.addAll(folders.stream().filter(f -> f.getId() == folderId).collect(Collectors.toSet()));

            //get decsendant
            List<DashboardFolder> children = folders.stream().filter(f -> f.getParentId() == parentId).collect(Collectors.toList());
            List<DashboardFolder> tmp = new ArrayList<>();
            while (children.size() != 0) {

                for (DashboardFolder c : children) {
                    ret.add(c);
                    int cid = c.getId();

                    tmp.addAll(folders.stream().filter(f -> f.getParentId() == cid).collect(Collectors.toList()));
                }
                children.clear();
                children.addAll(tmp);
                tmp.clear();
            }
        }
        return ret;
    }

    public boolean checkFolderAuth(String userId, int folderId){
        Set<DashboardFolder> ret = getFolderDescendant(roleService.getFolderIds(userId));

        for (DashboardFolder f : ret){
            if (f.getId() == folderId)
                return true;
        }
        return false;
    }
}
