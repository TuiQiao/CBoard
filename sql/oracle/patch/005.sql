-- 升级0.4需要执行的
ALTER  TABLE  dashboard_dataset ADD create_time TIMESTAMP DEFAULT sysdate;
ALTER  TABLE  dashboard_dataset ADD update_time TIMESTAMP DEFAULT sysdate;

ALTER  TABLE  dashboard_datasource ADD create_time TIMESTAMP DEFAULT sysdate;
ALTER  TABLE  dashboard_datasource ADD update_time TIMESTAMP DEFAULT sysdate;

ALTER  TABLE  dashboard_widget ADD create_time TIMESTAMP DEFAULT sysdate;
ALTER  TABLE  dashboard_widget ADD update_time TIMESTAMP DEFAULT sysdate;

ALTER  TABLE  dashboard_board ADD create_time TIMESTAMP DEFAULT sysdate;
ALTER  TABLE  dashboard_board ADD update_time TIMESTAMP DEFAULT sysdate;