drop sequence AUTO_INCREMENT;
CREATE SEQUENCE AUTO_INCREMENT
            INCREMENT BY 1  -- 每次加几个
            START WITH 1    -- 从1开始计数
            NOMAXVALUE      -- 不设置最大值
            NOCYCLE         -- 一直累加，不循环
            NOCACHE ;

CREATE TABLE dashboard_board (
  board_id NUMBER NOT NULL,
  user_id varchar2(50) NOT NULL,
  category_id NUMBER DEFAULT NULL,
  board_name varchar2(100) NOT NULL,
  layout_json CLOB,
  constraint dashboard_board_pk primary key (board_id)
);

create or replace trigger dashboard_board_insert
before insert on dashboard_board     /*触发条件：当向表dashboard_board执行插入操作时触发此触发器*/
 for each row                        /*对每一行都检测是否触发*/
 begin                                  /*触发器开始*/
       select AUTO_INCREMENT.nextval into :new.board_id from dual;   /*触发器主题内容，即触发后执行的动作，在此是取得序列dectuser_tb_seq的下一个值插入到表user_info_T中的id字段中*/
end;

CREATE TABLE dashboard_category (
  category_id NUMBER NOT NULL,
  category_name varchar2(100) NOT NULL,
  user_id varchar2(100) NOT NULL,
  constraint dashboard_category_pk primary key (category_id)
);

create or replace trigger dashboard_category_insert
before insert on dashboard_category
 for each row
 begin
       select AUTO_INCREMENT.nextval into :new.category_id from dual;
end;

CREATE TABLE dashboard_datasource (
  datasource_id NUMBER NOT NULL,
  user_id varchar2(50) NOT NULL,
  source_name varchar2(100) NOT NULL,
  source_type varchar2(100) NOT NULL,
  config CLOB,
  constraint dashboard_datasource_pk primary key (datasource_id)
);

create or replace trigger dashboard_datasource_insert
before insert on dashboard_datasource
 for each row
 begin
       select AUTO_INCREMENT.nextval into :new.datasource_id from dual;
end;

CREATE TABLE dashboard_widget (
  widget_id NUMBER NOT NULL,
  user_id varchar2(100) NOT NULL,
  category_name varchar2(100) DEFAULT NULL,
  widget_name varchar2(100) DEFAULT NULL,
  data_json CLOB,
  constraint dashboard_widget_pk primary key (widget_id)
);

create or replace trigger dashboard_widget_insert
before insert on dashboard_widget
 for each row
 begin
       select AUTO_INCREMENT.nextval into :new.widget_id from dual;
end;

CREATE TABLE dashboard_dataset (
  dataset_id NUMBER NOT NULL,
  user_id varchar2(100) NOT NULL,
  category_name varchar2(100) DEFAULT NULL,
  dataset_name varchar2(100) DEFAULT NULL,
  data_json CLOB,
  constraint dashboard_dataset_pk primary key (dataset_id)
);

create or replace trigger dashboard_dataset_insert
before insert on dashboard_dataset
 for each row
 begin
       select AUTO_INCREMENT.nextval into :new.dataset_id from dual;
end;

CREATE TABLE dashboard_user (
  user_id varchar2(50) NOT NULL,
  login_name varchar2(100) DEFAULT NULL,
  user_name varchar2(100) DEFAULT NULL,
  user_password varchar2(100) DEFAULT NULL,
  user_status varchar2(100) DEFAULT NULL,
  constraint dashboard_user_pk primary key (user_id)
);

INSERT INTO dashboard_user (user_id,login_name,user_name,user_password)
VALUES('1', 'admin', 'Administrator', 'ff9830c42660c1dd1942844f8069b74a');

CREATE TABLE dashboard_user_role (
  user_role_id number NOT NULL,
  user_id varchar2(100) DEFAULT NULL,
  role_id varchar2(100) DEFAULT NULL,
  constraint dashboard_user_role_pk primary key (user_role_id)
);

create or replace trigger dashboard_user_role_insert
before insert on dashboard_user_role
 for each row
 begin
       select AUTO_INCREMENT.nextval into :new.user_role_id from dual;
end;

CREATE TABLE dashboard_role (
  role_id varchar2(100) NOT NULL,
  role_name varchar(2100) DEFAULT NULL,
  user_id varchar2(50) DEFAULT NULL,
  constraint dashboard_role_pk primary key (role_id)
);

CREATE TABLE dashboard_role_res (
  role_res_id number NOT NULL,
  role_id varchar2(100) DEFAULT NULL,
  res_type varchar2(100) DEFAULT NULL,
  res_id number DEFAULT NULL,
  permission varchar2(20) DEFAULT NULL,
  constraint dashboard_role_res_pk primary key (role_res_id)
);

create or replace trigger dashboard_role_res_insert
before insert on dashboard_role_res
 for each row
 begin
       select AUTO_INCREMENT.nextval into :new.role_res_id from dual;
end;

CREATE TABLE dashboard_job (
  job_id number NOT NULL,
  job_name varchar2(200) DEFAULT NULL,
  cron_exp varchar2(200) DEFAULT NULL,
  start_date timestamp DEFAULT NULL,
  end_date timestamp DEFAULT NULL,
  job_type varchar2(200) DEFAULT NULL,
  job_config clob,
  user_id varchar2(100) DEFAULT NULL,
  last_exec_time timestamp DEFAULT NULL,
  job_status number,
  exec_log clob,
  constraint dashboard_job_pk primary key (job_id)
);

create or replace trigger dashboard_job_insert
before insert on dashboard_job
 for each row
 begin
       select AUTO_INCREMENT.nextval into :new.job_id from dual;
end;

CREATE TABLE dashboard_board_param (
  board_param_id number NOT NULL,
  user_id varchar2(50) NOT NULL,
  board_id number NOT NULL,
  config clob,
  constraint dashboard_board_param_pk primary key (board_param_id)
);

create or replace trigger dashboard_board_param_insert
before insert on dashboard_board_param
 for each row
 begin
       select AUTO_INCREMENT.nextval into :new.board_param_id from dual;
end;