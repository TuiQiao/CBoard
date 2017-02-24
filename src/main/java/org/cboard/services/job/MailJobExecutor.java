package org.cboard.services.job;

import org.cboard.dao.JobDao;
import org.cboard.dto.ViewDashboardJob;
import org.cboard.pojo.DashboardJob;
import org.cboard.services.MailService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.springframework.context.ApplicationContext;

import java.util.Date;

/**
 * Created by yfyuan on 2017/2/20.
 */
public class MailJobExecutor implements Job {
    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            MailService mailService = ((ApplicationContext) jobExecutionContext.getScheduler().getContext().get("applicationContext")).getBean(MailService.class);
            JobDao jobDao = ((ApplicationContext) jobExecutionContext.getScheduler().getContext().get("applicationContext")).getBean(JobDao.class);
            Long jobId = Long.parseLong(jobExecutionContext.getJobDetail().getKey().getName());
            jobDao.updateLastExecTime(jobId, new Date());
            try {
                jobDao.updateStatus(jobId, ViewDashboardJob.STATUS_PROCESSING);
                mailService.sendDashboard((DashboardJob) jobExecutionContext.getMergedJobDataMap().get("job"));
                jobDao.updateStatus(jobId, ViewDashboardJob.STATUS_FINISH);
            } catch (Exception e) {
                jobDao.updateStatus(jobId, ViewDashboardJob.STATUS_FAIL);
            }
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
    }
}
