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
  PRIMARY KEY CLUSTERED(role_res_id)
);


UPDATE dashboard_dataset SET user_id = '1';
UPDATE dashboard_datasource SET user_id = '1';
UPDATE dashboard_board SET user_id = '1';
UPDATE dashboard_widget SET user_id = '1';