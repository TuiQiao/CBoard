package org.cboard.dao;

import org.cboard.pojo.DashboardJob;

import java.util.List;

/**
 * Created by yfyuan on 2017/2/17.
 */
public interface JobDao {
    int save(DashboardJob job);

    List<DashboardJob> getJobList(String userId);
}
