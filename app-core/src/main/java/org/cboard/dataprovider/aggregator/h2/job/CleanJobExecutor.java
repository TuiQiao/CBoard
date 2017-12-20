package org.cboard.dataprovider.aggregator.h2.job;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;

/**
 * Created by zyong on 2017/9/18.
 */
public class CleanJobExecutor implements Job {

    private final Logger LOG = LoggerFactory.getLogger(this.getClass());

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            ApplicationContext springAppContext = (ApplicationContext) jobExecutionContext.getScheduler().getContext().get("applicationContext");
            CleanerService cleanerService = springAppContext.getBean(CleanerService.class);
            cleanerService.cleanDB();
        } catch (SchedulerException e) {
            LOG.error("", e);
        }
    }
}
