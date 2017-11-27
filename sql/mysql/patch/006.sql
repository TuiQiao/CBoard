DROP TABLE  dashboard_folder;
create TABLE dashboard_folder (
  folder_id int PRIMARY KEY AUTO_INCREMENT,
  folder_name VARCHAR(50),
  parent_id int DEFAULT -1,
  create_time TIMESTAMP DEFAULT now(),
  update_time TIMESTAMP DEFAULT now()
);
ALTER TABLE dashboard_folder AUTO_INCREMENT=10000;

#根目录
insert into dashboard_folder (folder_id,folder_name,parent_id) VALUES (10000,'Root', -1);


ALTER TABLE dashboard_dataset add COLUMN folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_widget add COLUMN folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_board CHANGE category_id folder_id INT;
ALTER  TABLE  dashboard_board  MODIFY COLUMN folder_id int DEFAULT 10000;


#脚本更新board的目录
INSERT into dashboard_folder (folder_name, parent_id) VALUEs('我的看板', 10000);
INSERT into dashboard_folder (folder_name, parent_id)
    SELECT category_name, 10000 FROM dashboard_category
;

UPDATE dashboard_board a
    JOIN dashboard_category c on a.folder_id = c.category_id
    JOIN dashboard_folder f on c.category_name = f.folder_name and f.parent_id=10000
    set a.folder_id = f.folder_id;

UPDATE dashboard_board a
set a.folder_id = (SELECT folder_id FROM dashboard_folder where folder_name = '我的看板' and parent_id=10000)
WHERE a.folder_id is NULL ;

#add version
DROP TABLE Maiden_Version;
CREATE TABLE Maiden_Version (
  id int PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50),
  status int DEFAULT 0,
  create_time TIMESTAMP DEFAULT now(),
  update_time TIMESTAMP DEFAULT now()
);

INSERT INTO maiden_version (name) values('Folder');

