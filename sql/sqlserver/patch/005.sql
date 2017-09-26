
ALTER  TABLE  dbo.dashboard_dataset ADD create_time DATETIME2 DEFAULT GETDATE()
ALTER  TABLE  dbo.dashboard_dataset ADD update_time DATETIME2 DEFAULT GETDATE()


ALTER  TABLE  dbo.dashboard_datasource ADD create_time DATETIME2 DEFAULT GETDATE()
ALTER  TABLE  dbo.dashboard_datasource ADD update_time DATETIME2 DEFAULT GETDATE()

ALTER  TABLE  dbo.dashboard_widget ADD create_time DATETIME2 DEFAULT GETDATE()
ALTER  TABLE  dbo.dashboard_widget ADD update_time DATETIME2 DEFAULT GETDATE()


ALTER  TABLE  dbo.dashboard_board ADD create_time DATETIME2 DEFAULT GETDATE()
ALTER  TABLE  dbo.dashboard_board change column update_time DATETIME2 DEFAULT GETDATE()

update  dbo.dashboard_dataset set create_time =getdate()
update  dbo.dashboard_dataset set update_time =getdate()
update  dbo.dashboard_datasource set create_time =getdate()
update  dbo.dashboard_datasource set update_time =getdate()
update  dbo.dashboard_widget set create_time =getdate()
update  dbo.dashboard_widget set update_time =getdate()
update  dbo.dashboard_board set create_time =getdate()
update  dbo.dashboard_board set update_time =getdate()