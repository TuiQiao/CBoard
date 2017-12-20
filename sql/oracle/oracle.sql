DROP sequence AUTO_INCREMENT;
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
  create_time TIMESTAMP DEFAULT sysdate,
  update_time TIMESTAMP DEFAULT sysdate,
  CONSTRAINT dashboard_board_pk PRIMARY KEY (board_id)
);

CREATE OR REPLACE TRIGGER dashboard_board_insert
BEFORE INSERT ON dashboard_board     /*触发条件：当向表dashboard_board执行插入操作时触发此触发器*/
 FOR EACH ROW                        /*对每一行都检测是否触发*/
 BEGIN                                  /*触发器开始*/
       SELECT AUTO_INCREMENT.nextval INTO :new.board_id FROM dual;   /*触发器主题内容，即触发后执行的动作，在此是取得序列dectuser_tb_seq的下一个值插入到表user_info_T中的id字段中*/
END;

CREATE TABLE dashboard_category (
  category_id NUMBER NOT NULL,
  category_name varchar2(100) NOT NULL,
  user_id varchar2(100) NOT NULL,
  CONSTRAINT dashboard_category_pk PRIMARY KEY (category_id)
);

CREATE OR REPLACE TRIGGER dashboard_category_insert
BEFORE INSERT ON dashboard_category
 FOR EACH ROW
 BEGIN
       SELECT AUTO_INCREMENT.nextval INTO :new.category_id FROM dual;
END;

CREATE TABLE dashboard_datasource (
  datasource_id NUMBER NOT NULL,
  user_id varchar2(50) NOT NULL,
  source_name varchar2(100) NOT NULL,
  source_type varchar2(100) NOT NULL,
  config CLOB,
  create_time TIMESTAMP DEFAULT sysdate,
  update_time TIMESTAMP DEFAULT sysdate,
  CONSTRAINT dashboard_datasource_pk PRIMARY KEY (datasource_id)
);

CREATE OR REPLACE TRIGGER dashboard_datasource_insert
BEFORE INSERT ON dashboard_datasource
 FOR EACH ROW
 BEGIN
       SELECT AUTO_INCREMENT.nextval INTO :new.datasource_id FROM dual;
END;

CREATE TABLE dashboard_widget (
  widget_id NUMBER NOT NULL,
  user_id varchar2(100) NOT NULL,
  category_name varchar2(100) DEFAULT NULL,
  widget_name varchar2(100) DEFAULT NULL,
  data_json CLOB,
  create_time TIMESTAMP DEFAULT sysdate,
  update_time TIMESTAMP DEFAULT sysdate,
  CONSTRAINT dashboard_widget_pk PRIMARY KEY (widget_id)
);

CREATE OR REPLACE TRIGGER dashboard_widget_insert
BEFORE INSERT ON dashboard_widget
 FOR EACH ROW
 BEGIN
       SELECT AUTO_INCREMENT.nextval INTO :new.widget_id FROM dual;
END;

CREATE TABLE dashboard_dataset (
  dataset_id NUMBER NOT NULL,
  user_id varchar2(100) NOT NULL,
  category_name varchar2(100) DEFAULT NULL,
  dataset_name varchar2(100) DEFAULT NULL,
  data_json CLOB,
  create_time TIMESTAMP DEFAULT sysdate,
  update_time TIMESTAMP DEFAULT sysdate,
  CONSTRAINT dashboard_dataset_pk PRIMARY KEY (dataset_id)
);

CREATE OR REPLACE TRIGGER dashboard_dataset_insert
BEFORE INSERT ON dashboard_dataset
 FOR EACH ROW
 BEGIN
       SELECT AUTO_INCREMENT.nextval INTO :new.dataset_id FROM dual;
END;

CREATE TABLE dashboard_user (
  user_id varchar2(50) NOT NULL,
  login_name varchar2(100) DEFAULT NULL,
  user_name varchar2(100) DEFAULT NULL,
  user_password varchar2(100) DEFAULT NULL,
  user_status varchar2(100) DEFAULT NULL,
  CONSTRAINT dashboard_user_pk PRIMARY KEY (user_id)
);

INSERT INTO dashboard_user (user_id,login_name,user_name,user_password)
VALUES('1', 'admin', 'Administrator', 'ff9830c42660c1dd1942844f8069b74a');

CREATE TABLE dashboard_user_role (
  user_role_id number NOT NULL,
  user_id varchar2(100) DEFAULT NULL,
  role_id varchar2(100) DEFAULT NULL,
  CONSTRAINT dashboard_user_role_pk PRIMARY KEY (user_role_id)
);

CREATE OR REPLACE TRIGGER dashboard_user_role_insert
BEFORE INSERT ON dashboard_user_role
 FOR EACH ROW
 BEGIN
       SELECT AUTO_INCREMENT.nextval INTO :new.user_role_id FROM dual;
END;

CREATE TABLE dashboard_role (
  role_id varchar2(100) NOT NULL,
  role_name varchar(2100) DEFAULT NULL,
  user_id varchar2(50) DEFAULT NULL,
  CONSTRAINT dashboard_role_pk PRIMARY KEY (role_id)
);

CREATE TABLE dashboard_role_res (
  role_res_id number NOT NULL,
  role_id varchar2(100) DEFAULT NULL,
  res_type varchar2(100) DEFAULT NULL,
  res_id number DEFAULT NULL,
  permission varchar2(20) DEFAULT NULL,
  CONSTRAINT dashboard_role_res_pk PRIMARY KEY (role_res_id)
);

CREATE OR REPLACE TRIGGER dashboard_role_res_insert
BEFORE INSERT ON dashboard_role_res
 FOR EACH ROW
 BEGIN
       SELECT AUTO_INCREMENT.nextval INTO :new.role_res_id FROM dual;
END;

CREATE TABLE dashboard_job (
  job_id number NOT NULL,
  job_name varchar2(200) DEFAULT NULL,
  cron_exp varchar2(200) DEFAULT NULL,
  start_date TIMESTAMP DEFAULT NULL,
  end_date TIMESTAMP DEFAULT NULL,
  job_type varchar2(200) DEFAULT NULL,
  job_config CLOB,
  user_id varchar2(100) DEFAULT NULL,
  last_exec_time TIMESTAMP DEFAULT NULL,
  job_status number,
  exec_log CLOB,
  CONSTRAINT dashboard_job_pk PRIMARY KEY (job_id)
);

CREATE OR REPLACE TRIGGER dashboard_job_insert
BEFORE INSERT ON dashboard_job
 FOR EACH ROW
 BEGIN
       SELECT AUTO_INCREMENT.nextval INTO :new.job_id FROM dual;
END;

CREATE TABLE dashboard_board_param (
  board_param_id number NOT NULL,
  user_id varchar2(50) NOT NULL,
  board_id number NOT NULL,
  config CLOB,
  CONSTRAINT dashboard_board_param_pk PRIMARY KEY (board_param_id)
);

CREATE OR REPLACE TRIGGER dashboard_board_param_insert
BEFORE INSERT ON dashboard_board_param
 FOR EACH ROW
 BEGIN
       SELECT AUTO_INCREMENT.nextval INTO :new.board_param_id FROM dual;
END;