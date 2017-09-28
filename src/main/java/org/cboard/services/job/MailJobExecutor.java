package org.cboard.services.job;

import org.cboard.pojo.DashboardJob;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;

/**
 * Created by yfyuan on 2017/2/20.
 */
public class MailJobExecutor implements Job {

    private Logger LOG = LoggerFactory.getLogger(this.getClass());

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            JobService jobService = ((ApplicationContext) jobExecutionContext.getScheduler().getContext().get("applicationContext")).getBean(JobService.class);
            jobService.sendMail((DashboardJob) jobExecutionContext.getMergedJobDataMap().get("job"));
        } catch (SchedulerException e) {
            LOG.error("", e);
        }
    }
}
