package org.cboard.services.meta;

import com.alibaba.fastjson.JSONObject;
import org.cboard.dao.DatasetDao;
import org.cboard.dao.FolderDao;
import org.cboard.dao.MetaVersionDao;
import org.cboard.dao.WidgetDao;
import org.cboard.pojo.DashboardDataset;
import org.cboard.pojo.DashboardFolder;
import org.cboard.pojo.DashboardWidget;
import org.cboard.pojo.MetaVersion;
import org.cboard.services.FolderService;
import org.cboard.services.ServiceStatus;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.util.List;

/**
 * Created by jx_luo on 2017/11/6.
 */
@Service
public class FolderData implements InitializingBean {
    private static boolean isStart = false;

    @Autowired
    private FolderDao folderDao;
    @Autowired
    private FolderService folderService;

    @Autowired
    private MetaVersionDao versionDao;

    @Autowired
    private DatasetDao datasetDao;

    @Autowired
    private WidgetDao widgetDao;

    private String currentVersion = "Folder";

    @Value("${admin_user_id}")
    private String userId;

    private int generateFolder(String categoryName) {
        int parentId = 10000;
        JSONObject f = new JSONObject();
        ServiceStatus status;

        if (categoryName.indexOf("/") == -1) {
            f.put("name", categoryName);
            f.put("parentId", 10000);
            status = folderService.save(userId, f.toJSONString());
            if (status.getStatus().equals("1")) {
                parentId = status.getId().intValue();
            } else {
                DashboardFolder folder = folderDao.getFolder(10000, categoryName);
                parentId = folder.getId();
            }
        } else {
            String[] arr = categoryName.split("/");
            for (String s : arr) {
                f.put("name", s);
                f.put("parentId", parentId);
                status = folderService.save(userId, f.toJSONString());
                if (status.getStatus().equals("1")) {
                    parentId = status.getId().intValue();
                } else {
                    DashboardFolder folder = folderDao.getFolder(parentId, s);
                    parentId = folder.getId();
                }
            }
        }
        return parentId;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        MetaVersion version = versionDao.getMetaVersion(currentVersion);

        if (version != null && version.getstatus() == 0) {

            List<DashboardDataset> ds = datasetDao.getAllDatasetList();
            List<DashboardWidget> widgt = widgetDao.getAllWidgetList();

            for (DashboardDataset d : ds) {
                d.setFolderId(generateFolder(d.getCategoryName()));
                datasetDao.update(d);
            }

            for (DashboardWidget w : widgt) {
                w.setFolderId(generateFolder(w.getCategoryName()));
                widgetDao.update(w);
            }

            //修改状态
            version.setstatus(1);
            versionDao.update(version);
        }
    }
}
