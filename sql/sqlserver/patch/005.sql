ALTER  TABLE  dbo.dashboard_dataset ADD create_time DATETIME2 DEFAULT GETDATE();
ALTER  TABLE  dbo.dashboard_dataset ADD update_time DATETIME2 DEFAULT GETDATE();

ALTER  TABLE  dbo.dashboard_datasource ADD create_time DATETIME2 DEFAULT GETDATE();
ALTER  TABLE  dbo.dashboard_datasource ADD update_time DATETIME2 DEFAULT GETDATE();

ALTER  TABLE  dbo.dashboard_widget ADD create_time DATETIME2 DEFAULT GETDATE();
ALTER  TABLE  dbo.dashboard_widget ADD update_time DATETIME2 DEFAULT GETDATE();

ALTER  TABLE  dbo.dashboard_board ADD create_time DATETIME2 DEFAULT GETDATE();
ALTER  TABLE  dbo.dashboard_board ADD update_time DATETIME2 DEFAULT GETDATE();

--
UPDATE  dbo.dashboard_dataset SET create_time = getdate();
UPDATE  dbo.dashboard_dataset SET update_time = getdate();
UPDATE  dbo.dashboard_datasource SET create_time = getdate();
UPDATE  dbo.dashboard_datasource SET update_time = getdate();
UPDATE  dbo.dashboard_widget SET create_time = getdate();
UPDATE  dbo.dashboard_widget SET update_time = getdate();
UPDATE  dbo.dashboard_board SET create_time = getdate();
UPDATE  dbo.dashboard_board SET update_time = getdate();