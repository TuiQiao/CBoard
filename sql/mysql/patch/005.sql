SET SQL_MODE='ALLOW_INVALID_DATES';
-- 升级0.4需要执行的
ALTER TABLE dashboard_dataset ADD create_time TIMESTAMP DEFAULT now();
ALTER TABLE dashboard_dataset ADD update_time TIMESTAMP;
UPDATE dashboard_dataset SET update_time = create_time;
-- Use trigger set update time
CREATE TRIGGER insert_dataset_update_time_trigger
BEFORE INSERT ON dashboard_dataset FOR EACH ROW SET new.update_time = now();
CREATE TRIGGER update_dataset_update_time_trigger
BEFORE UPDATE ON dashboard_dataset FOR EACH ROW SET new.update_time = now();

ALTER TABLE dashboard_datasource ADD create_time TIMESTAMP DEFAULT now();
ALTER TABLE dashboard_datasource ADD update_time TIMESTAMP;
UPDATE dashboard_datasource SET update_time = create_time;
-- Use trigger set update time
CREATE TRIGGER insert_datasource_update_time_trigger
BEFORE INSERT ON dashboard_datasource FOR EACH ROW SET new.update_time = now();
CREATE TRIGGER update_datasource_update_time_trigger
BEFORE UPDATE ON dashboard_datasource FOR EACH ROW SET new.update_time = now();

ALTER TABLE dashboard_widget ADD create_time TIMESTAMP DEFAULT now();
ALTER TABLE dashboard_widget ADD update_time TIMESTAMP;
UPDATE dashboard_widget SET update_time = create_time;
-- Use trigger set update time
CREATE TRIGGER insert_widget_update_time_trigger
BEFORE INSERT ON dashboard_widget FOR EACH ROW SET new.update_time = now();
CREATE TRIGGER update_widget_update_time_trigger
BEFORE UPDATE ON dashboard_widget FOR EACH ROW SET new.update_time = now();

ALTER TABLE dashboard_board ADD create_time TIMESTAMP DEFAULT now();
ALTER TABLE dashboard_board ADD update_time TIMESTAMP;
UPDATE dashboard_board SET update_time = create_time;
-- Use trigger set update time
CREATE TRIGGER insert_board_update_time_trigger
BEFORE INSERT ON dashboard_board FOR EACH ROW SET new.update_time = now();
CREATE TRIGGER update_board_update_time_trigger
BEFORE UPDATE ON dashboard_board FOR EACH ROW SET new.update_time = now();