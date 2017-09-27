-- Update from 0.3 to 0.4
ALTER  TABLE  dashboard_dataset ADD create_time TIMESTAMP DEFAULT now();
ALTER  TABLE  dashboard_dataset ADD update_time TIMESTAMP DEFAULT now();

ALTER  TABLE  dashboard_datasource ADD create_time TIMESTAMP DEFAULT now();
ALTER  TABLE  dashboard_datasource ADD update_time TIMESTAMP DEFAULT now();

ALTER  TABLE  dashboard_widget ADD create_time TIMESTAMP DEFAULT now();
ALTER  TABLE  dashboard_widget ADD update_time TIMESTAMP DEFAULT now();

ALTER  TABLE  dashboard_board ADD create_time TIMESTAMP DEFAULT now();
ALTER  TABLE  dashboard_board ADD update_time TIMESTAMP DEFAULT now();