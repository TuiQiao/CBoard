package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.cboard.dao.JobDao;
import org.cboard.pojo.DashboardJob;
import org.cboard.services.job.MailJobExecutor;
import org.quartz.*;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

/**
 * Created by yfyuan on 2017/2/17.
 */
@Service
public class JobService implements InitializingBean {

    @Autowired
    private SchedulerFactoryBean schedulerFactoryBean;

    @Autowired
    private JobDao jobDao;

    @Value("${admin_user_id}")
    private String adminUserId;

    public void configScheduler() {
        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            scheduler.clear();
            List<DashboardJob> jobList = jobDao.getJobList(adminUserId);
            for (DashboardJob job : jobList) {
                JobDetail jobDetail = JobBuilder.newJob(getJobExecutor(job)).withIdentity(job.getId().toString()).build();
                long startTimeStamp = job.getStartDate().getTime();
                CronTrigger trigger = TriggerBuilder.newTrigger()
                        .startAt(new Date().getTime() - startTimeStamp < 0 ? job.getStartDate() : new Date())
                        .withSchedule(CronScheduleBuilder.cronSchedule(job.getCronExp()))
                        .endAt(job.getEndDate())
                        .build();
                jobDetail.getJobDataMap().put("job", job);
                scheduler.scheduleJob(jobDetail, trigger);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Class<? extends Job> getJobExecutor(DashboardJob job) {
        switch (job.getJobType()) {
            case "mail":
                return MailJobExecutor.class;
        }
        return null;
    }

    public ServiceStatus save(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardJob job = new DashboardJob();
        job.setUserId(userId);
        job.setName(jsonObject.getString("name"));
        job.setConfig(jsonObject.getString("config"));
        job.setCronExp(jsonObject.getString("cronExp"));
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        try {
            job.setStartDate(format.parse(jsonObject.getJSONObject("daterange").getString("startDate")));
            job.setEndDate(format.parse(jsonObject.getJSONObject("daterange").getString("endDate")));
        } catch (ParseException e) {
            e.printStackTrace();
        }
        job.setJobType(jsonObject.getString("jobType"));
        jobDao.save(job);
        configScheduler();
        return new ServiceStatus(ServiceStatus.Status.Success, "success");
    }

    public ServiceStatus update(String userId, String json) {
        JSONObject jsonObject = JSONObject.parseObject(json);
        DashboardJob job = new DashboardJob();
        job.setId(jsonObject.getLong("id"));
        job.setName(jsonObject.getString("name"));
        job.setConfig(jsonObject.getString("config"));
        job.setCronExp(jsonObject.getString("cronExp"));
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        try {
            job.setStartDate(format.parse(jsonObject.getJSONObject("daterange").getString("startDate")));
            job.setEndDate(format.parse(jsonObject.getJSONObject("daterange").getString("endDate")));
        } catch (ParseException e) {
            e.printStackTrace();
        }
        job.setJobType(jsonObject.getString("jobType"));
        jobDao.update(job);
        configScheduler();
        return new ServiceStatus(ServiceStatus.Status.Success, "success");
    }

    public ServiceStatus delete(String userId, Long id) {
        jobDao.delete(id);
        configScheduler();
        return new ServiceStatus(ServiceStatus.Status.Success, "success");
    }

    public ServiceStatus exec(String userId, Long id) {
        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            scheduler.triggerJob(JobKey.jobKey(id.toString()));
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } catch (SchedulerException e) {
            e.printStackTrace();
            return new ServiceStatus(ServiceStatus.Status.Fail, e.getMessage());
        }
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        configScheduler();
    }
}
