DROP TABLE  dashboard_folder;
create TABLE dashboard_folder (
  folder_id int PRIMARY KEY IDENTITY(10000,1),
  folder_name VARCHAR(50),
  parent_id int DEFAULT -1,
  is_private int DEFAULT 0,
  user_id VARCHAR(50) DEFAULT '1',
  create_time DATETIME2 DEFAULT GETDATE(),
  update_time DATETIME2 DEFAULT GETDATE()
);

--根目录
insert into dashboard_folder (folder_name,parent_id) VALUES ('Root', -1);

ALTER TABLE dashboard_dataset add  folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_widget add  folder_id INT DEFAULT 10000;

sp_rename 'dashboard_board.category_id',folder_id,'column'


#脚本更新board的目录
INSERT into dashboard_folder (folder_name, parent_id, is_private) VALUEs('.private', 10000, 1);
INSERT into dashboard_folder (folder_name, parent_id)
    SELECT category_name, 10000 FROM dashboard_category
;

UPDATE dashboard_board set folder_id = f.folder_id
	FROM dashboard_board a
    JOIN dashboard_category c on a.folder_id = c.category_id
    JOIN dashboard_folder f on c.category_name = f.folder_name and f.parent_id=10000
    ;

UPDATE dashboard_board
set folder_id = (SELECT folder_id FROM dashboard_folder where folder_name = '.private' and parent_id=10000)
WHERE folder_id is NULL ;

--add  version
DROP TABLE Maiden_Version;
CREATE TABLE Maiden_Version (
  id int PRIMARY KEY IDENTITY(1,1),
  name VARCHAR(50),
  status int DEFAULT 0,
  create_time DATETIME2 DEFAULT getdate(),
  update_time DATETIME2 DEFAULT getdate()
);

INSERT INTO maiden_version (name) values('Folder');

