CREATE TABLE dashboard_dataset (
  dataset_id bigint identity(1,1),
  user_id varchar(100) NOT NULL,
  category_name varchar(100) DEFAULT NULL,
  dataset_name varchar(100) DEFAULT NULL,
  data_json text,
  PRIMARY KEY CLUSTERED(dataset_id)
);