--
CREATE DATABASE CBoard;

CREATE TABLE dashboard_board (
  board_id bigint identity(1,1),
  user_id varchar(50) NOT NULL,
  category_id bigint DEFAULT NULL,
  board_name varchar(100) NOT NULL,
  layout_json text,
  PRIMARY KEY CLUSTERED (board_id)
);

CREATE TABLE dashboard_category (
  category_id bigint identity(1,1),
  category_name varchar(100) NOT NULL,
  user_id varchar(100) NOT NULL,
  PRIMARY KEY CLUSTERED (category_id)
);

CREATE TABLE dashboard_datasource (
  datasource_id bigint identity(1,1),
  user_id varchar(50) NOT NULL,
  source_name varchar(100) NOT NULL,
  source_type varchar(100) NOT NULL,
  config text,
  PRIMARY KEY CLUSTERED (datasource_id)
);

CREATE TABLE dashboard_widget (
  widget_id bigint identity(1,1),
  user_id varchar(100) NOT NULL,
  category_name varchar(100) DEFAULT NULL,
  widget_name varchar(100) DEFAULT NULL,
  data_json text,
  PRIMARY KEY CLUSTERED (widget_id)
);

CREATE TABLE dashboard_dataset (
  dataset_id bigint identity(1,1),
  user_id varchar(100) NOT NULL,
  category_name varchar(100) DEFAULT NULL,
  dataset_name varchar(100) DEFAULT NULL,
  data_json text,
  PRIMARY KEY CLUSTERED(dataset_id)
);

CREATE TABLE dashboard_user (
  user_id varchar(50) NOT NULL,
  login_name varchar(100) DEFAULT NULL,
  user_name varchar(100) DEFAULT NULL,
  user_password varchar(100) DEFAULT NULL,
  user_status varchar(100) DEFAULT NULL,
  PRIMARY KEY CLUSTERED(user_id)
);

INSERT INTO dashboard_user (user_id,login_name,user_name,user_password)
VALUES('1','admin','Administrator','ff9830c42660c1dd1942844f8069b74a');

CREATE TABLE dashboard_user_role (
  user_role_id bigint identity(1,1),
  user_id varchar(100) DEFAULT NULL,
  role_id varchar(100) DEFAULT NULL,
  PRIMARY KEY CLUSTERED(user_role_id)
);

CREATE TABLE dashboard_role (
  role_id varchar(100) NOT NULL,
  role_name varchar(100) DEFAULT NULL,
  user_id varchar(50) DEFAULT NULL,
  PRIMARY KEY CLUSTERED(role_id)
);

CREATE TABLE dashboard_role_res (
  role_res_id bigint identity(1,1),
  role_id varchar(100) DEFAULT NULL,
  res_type varchar(100) DEFAULT NULL,
  res_id bigint DEFAULT NULL,
  permission varchar(20) DEFAULT NULL,
  PRIMARY KEY CLUSTERED(role_res_id)
);

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

CREATE TABLE dashboard_board_param (
  board_param_id bigint identity(1,1),
  user_id varchar(50) NOT NULL,
  board_id bigint NOT NULL,
  config text,
  PRIMARY KEY CLUSTERED (board_param_id)
);

ALTER  TABLE  dbo.dashboard_dataset ADD create_time DATETIME2 DEFAULT GETDATE();
ALTER  TABLE  dbo.dashboard_dataset ADD update_time DATETIME2 DEFAULT GETDATE();

ALTER  TABLE  dbo.dashboard_datasource ADD create_time DATETIME2 DEFAULT GETDATE();
ALTER  TABLE  dbo.dashboard_datasource ADD update_time DATETIME2 DEFAULT GETDATE();

ALTER  TABLE  dbo.dashboard_widget ADD create_time DATETIME2 DEFAULT GETDATE();
ALTER  TABLE  dbo.dashboard_widget ADD update_time DATETIME2 DEFAULT GETDATE();

ALTER  TABLE  dbo.dashboard_board ADD create_time DATETIME2 DEFAULT GETDATE();
ALTER  TABLE  dbo.dashboard_board change COLUMN update_time DATETIME2 DEFAULT GETDATE();

-- Real folder
DROP TABLE dashboard_folder;
CREATE TABLE dashboard_folder (
  folder_id int PRIMARY KEY IDENTITY(10000,1),
  folder_name VARCHAR(50),
  parent_id int DEFAULT -1,
  is_private int DEFAULT 0,
  user_id VARCHAR(50) DEFAULT '1',
  create_time DATETIME2 DEFAULT GETDATE(),
  update_time DATETIME2 DEFAULT GETDATE()
);

-- 根目录
INSERT INTO dashboard_folder (folder_name,parent_id) VALUES ('Root', -1);
INSERT into dashboard_folder (folder_name, parent_id, is_private) VALUES ('.private', 10000, 1);
INSERT into dashboard_folder (folder_name, parent_id) SELECT category_name, 10000 FROM dashboard_category;

ALTER TABLE dashboard_dataset ADD folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_widget  ADD folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_board   ADD folder_id bigint DEFAULT NULL;

-- 脚本更新board的目录
UPDATE dashboard_board set folder_id = f.folder_id
  FROM dashboard_board a
  JOIN dashboard_category c on a.category_id = c.category_id
  JOIN dashboard_folder f on c.category_name = f.folder_name and f.parent_id=10000
;

-- Update Private Folder id
UPDATE dashboard_board
   SET folder_id = (SELECT folder_id FROM dashboard_folder WHERE folder_name = '.private' AND parent_id=10000)
 WHERE folder_id IS NULL ;

-- add version
DROP TABLE Meta_Version;
CREATE TABLE Meta_Version (
  id int PRIMARY KEY IDENTITY(1,1),
  name VARCHAR(50),
  status int DEFAULT 0,
  create_time DATETIME2 DEFAULT getdate(),
  update_time DATETIME2 DEFAULT getdate()
);

INSERT INTO Meta_Version (name) values('Folder');



