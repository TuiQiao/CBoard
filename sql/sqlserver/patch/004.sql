CREATE TABLE dashboard_job (
  job_id bigint identity(1,1),
  job_name varchar(200) DEFAULT NULL,
  cron_exp varchar(200) DEFAULT NULL,
  start_date datetime NULL DEFAULT NULL,
  end_date datetime NULL DEFAULT NULL,
  job_type varchar(200) DEFAULT NULL,
  job_config text,
  user_id varchar(100) DEFAULT NULL,
  last_exec_time datetime NULL DEFAULT NULL,
  job_status bigint,
  exec_log text,
  PRIMARY KEY CLUSTERED (job_id)
);
