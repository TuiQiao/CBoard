CREATE TABLE dashboard_board (
  board_id bigint(20) NOT NULL AUTO_INCREMENT,
  user_id varchar(50) NOT NULL,
  category_id bigint(20) DEFAULT NULL,
  board_name varchar(100) NOT NULL,
  layout_json text,
  PRIMARY KEY (board_id)
);

CREATE TABLE dashboard_category (
  category_id bigint(20) NOT NULL AUTO_INCREMENT,
  category_name varchar(100) NOT NULL,
  user_id varchar(100) NOT NULL,
  PRIMARY KEY (category_id)
);

CREATE TABLE dashboard_datasource (
  datasource_id bigint(20) NOT NULL AUTO_INCREMENT,
  user_id varchar(50) NOT NULL,
  source_name varchar(100) NOT NULL,
  source_type varchar(100) NOT NULL,
  config text,
  PRIMARY KEY (datasource_id)
);

CREATE TABLE dashboard_widget (
  widget_id bigint(20) NOT NULL AUTO_INCREMENT,
  user_id varchar(100) NOT NULL,
  category_name varchar(100) DEFAULT NULL,
  widget_name varchar(100) DEFAULT NULL,
  data_json text,
  PRIMARY KEY (widget_id)
);

CREATE TABLE dashboard_dataset (
  dataset_id bigint(20) NOT NULL AUTO_INCREMENT,
  user_id varchar(100) NOT NULL,
  category_name varchar(100) DEFAULT NULL,
  dataset_name varchar(100) DEFAULT NULL,
  data_json text,
  PRIMARY KEY (dataset_id)
);

CREATE TABLE dashboard_user (
  user_id varchar(50) NOT NULL,
  login_name varchar(100) DEFAULT NULL,
  user_name varchar(100) DEFAULT NULL,
  user_password varchar(100) DEFAULT NULL,
  user_status varchar(100) DEFAULT NULL,
  PRIMARY KEY (user_id)
);

INSERT INTO dashboard_user (user_id,login_name,user_name,user_password)
VALUES('1', 'admin', 'Administrator', 'ff9830c42660c1dd1942844f8069b74a');

CREATE TABLE dashboard_user_role (
  user_role_id bigint(20) NOT NULL AUTO_INCREMENT,
  user_id varchar(100) DEFAULT NULL,
  role_id varchar(100) DEFAULT NULL,
  PRIMARY KEY (user_role_id)
);

CREATE TABLE dashboard_role (
  role_id varchar(100) NOT NULL,
  role_name varchar(100) DEFAULT NULL,
  user_id varchar(50) DEFAULT NULL,
  PRIMARY KEY (role_id)
);

CREATE TABLE dashboard_role_res (
  role_res_id bigint(20) NOT NULL AUTO_INCREMENT,
  role_id varchar(100) DEFAULT NULL,
  res_type varchar(100) DEFAULT NULL,
  res_id bigint(20) DEFAULT NULL,
  permission varchar(20) DEFAULT NULL,
  PRIMARY KEY (role_res_id)
);

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

CREATE TABLE dashboard_board_param (
  board_param_id bigint(20) NOT NULL AUTO_INCREMENT,
  user_id varchar(50) NOT NULL,
  board_id bigint(20) NOT NULL,
  config text,
  PRIMARY KEY (board_param_id)
);

-- 升级0.4需要执行的
ALTER  TABLE  dashboard_dataset ADD create_time TIMESTAMP DEFAULT now();
ALTER  TABLE  dashboard_dataset ADD update_time TIMESTAMP DEFAULT now();

ALTER  TABLE  dashboard_datasource ADD create_time TIMESTAMP DEFAULT now();
ALTER  TABLE  dashboard_datasource ADD update_time TIMESTAMP DEFAULT now();

ALTER  TABLE  dashboard_widget ADD create_time TIMESTAMP DEFAULT now();
ALTER  TABLE  dashboard_widget ADD update_time TIMESTAMP DEFAULT now();

ALTER  TABLE  dashboard_board ADD create_time TIMESTAMP DEFAULT now();
ALTER  TABLE  dashboard_board ADD update_time TIMESTAMP DEFAULT now();

-- Real folder
DROP TABLE  dashboard_folder;
create TABLE dashboard_folder (
  folder_id int PRIMARY KEY AUTO_INCREMENT,
  folder_name VARCHAR(50),
  parent_id int DEFAULT -1,
  create_time TIMESTAMP DEFAULT now(),
  update_time TIMESTAMP DEFAULT now()
);
ALTER TABLE dashboard_folder AUTO_INCREMENT=10000;

#根目录
insert into dashboard_folder (folder_id,folder_name,parent_id) VALUES (10000,'Root', -1);

ALTER TABLE dashboard_dataset add COLUMN folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_widget add COLUMN folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_board CHANGE category_id folder_id INT;
ALTER  TABLE  dashboard_board  MODIFY COLUMN folder_id int DEFAULT 10000;


#脚本更新board的目录
INSERT into dashboard_folder (folder_name, parent_id) VALUEs('我的看板', 10000);
INSERT into dashboard_folder (folder_name, parent_id)
    SELECT category_name, 10000 FROM dashboard_category
;

UPDATE dashboard_board a
    JOIN dashboard_category c on a.folder_id = c.category_id
    JOIN dashboard_folder f on c.category_name = f.folder_name and f.parent_id=10000
    set a.folder_id = f.folder_id;

UPDATE dashboard_board a
set a.folder_id = (SELECT folder_id FROM dashboard_folder where folder_name = '我的看板' and parent_id=10000)
WHERE a.folder_id is NULL ;

#add version
DROP TABLE Maiden_Version;
CREATE TABLE Maiden_Version (
  id int PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50),
  status int DEFAULT 0,
  create_time TIMESTAMP DEFAULT now(),
  update_time TIMESTAMP DEFAULT now()
);

INSERT INTO maiden_version (name) values('Folder');

