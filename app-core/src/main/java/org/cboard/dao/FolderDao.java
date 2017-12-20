package org.cboard.dao;

import org.cboard.pojo.DashboardFolder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Created by jx_luo on 2017/10/13.
 */
@Repository
public interface FolderDao {

    List<DashboardFolder> getAllFolderList();

    List<DashboardFolder> getFolderByUserId(String userId);

    DashboardFolder getFolder(int parentId, String name);

    DashboardFolder getFolderById(int id);

    long countExistFolderName(Map<String, Object> map);

    int save(DashboardFolder folder);

    int update(DashboardFolder folder);

    int delete(int id);
}
