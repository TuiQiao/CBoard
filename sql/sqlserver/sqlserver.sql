--
CREATE DATABASE AdminBoard;

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