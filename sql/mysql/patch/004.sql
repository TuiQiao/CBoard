CREATE TABLE dashboard_job (
  job_id bigint(20) NOT NULL AUTO_INCREMENT,
  job_name varchar(200) DEFAULT NULL,
  cron_exp varchar(200) DEFAULT NULL,
  start_date timestamp NULL DEFAULT NULL,
  end_date timestamp NULL DEFAULT NULL,
  job_type varchar(200) DEFAULT NULL,
  job_config text,
  user_id varchar(100) DEFAULT NULL,
  last_exec_time timestamp NULL DEFAULT NULL,
  job_status bigint(20),
  exec_log text,
  PRIMARY KEY (job_id)
);
