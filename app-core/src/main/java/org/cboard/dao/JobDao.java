package org.cboard.dao;

import org.cboard.pojo.DashboardJob;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * Created by yfyuan on 2017/2/17.
 */
@Repository
public interface JobDao {
    int save(DashboardJob job);

    int update(DashboardJob job);

    List<DashboardJob> getJobList(String userId);

    List<DashboardJob> getJobListAdmin(String userId);

    int delete(Long jobId);

    int updateLastExecTime(Long jobId, Date date);

    int updateStatus(Long jobId, Long status, String log);

    DashboardJob getJob(Long jobId);

    long checkJobRole(String userId, Long jobId, String permissionPattern);

}
