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

ALTER TABLE dashboard_role_res ADD permission varchar(20);

CREATE TABLE dashboard_board_param (
  board_param_id bigint identity(1,1),
  user_id varchar(50) NOT NULL,
  board_id bigint NOT NULL,
  config text,
  PRIMARY KEY CLUSTERED (board_param_id)
);