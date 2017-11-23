DROP TABLE  dashboard_folder;
create TABLE dashboard_folder (
  folder_id int PRIMARY KEY AUTO_INCREMENT,
  folder_name VARCHAR(50),
  parent_id int DEFAULT -1,
  create_time TIMESTAMP DEFAULT now(),
  update_time TIMESTAMP DEFAULT now()
);
alter table dashboard_folder AUTO_INCREMENT=10000;

alter table dashboard_dataset add COLUMN folder_id INT DEFAULT -1;
alter table dashboard_widget add COLUMN folder_id INT DEFAULT -1;