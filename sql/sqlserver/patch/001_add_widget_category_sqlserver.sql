ALTER TABLE dbo.dashboard_widget DROP COLUMN category_id;
ALTER TABLE dbo.dashboard_widget ADD category_name varchar(100);
UPDATE dbo.dashboard_widget SET category_name = '默认分类' WHERE category_name IS NULL;