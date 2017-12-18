DROP TABLE  dashboard_folder;
CREATE TABLE dashboard_folder (
  folder_id int PRIMARY KEY AUTO_INCREMENT,
  folder_name VARCHAR(50),
  parent_id int DEFAULT -1,
  is_private int DEFAULT 0,
  user_id VARCHAR(50) DEFAULT '1',
  create_time TIMESTAMP DEFAULT now(),
  update_time TIMESTAMP DEFAULT now()
);
ALTER TABLE dashboard_folder AUTO_INCREMENT=10000;

-- 根目录
INSERT INTO dashboard_folder (folder_id,folder_name,parent_id) VALUES (10000,'Root', -1);
-- 脚本更新board的目录
INSERT INTO dashboard_folder (folder_name, parent_id, is_private) VALUES ('.private', 10000, 1);
INSERT INTO dashboard_folder (folder_name, parent_id) SELECT category_name, 10000 FROM dashboard_category;


ALTER TABLE dashboard_dataset ADD COLUMN folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_widget ADD COLUMN folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_board CHANGE category_id folder_id INT;
ALTER TABLE dashboard_board MODIFY COLUMN folder_id int DEFAULT 10000;

UPDATE dashboard_board a
  JOIN dashboard_category c on a.folder_id = c.category_id
  JOIN dashboard_folder f on c.category_name = f.folder_name and f.parent_id=10000 SET a.folder_id = f.folder_id;

UPDATE dashboard_board a
SET a.folder_id = (SELECT folder_id FROM dashboard_folder where folder_name = '.private' and parent_id=10000)
WHERE a.folder_id is NULL;

-- add version
DROP TABLE IF EXISTS Meta_Version;
CREATE TABLE Meta_Version (
  id int PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50),
  status int DEFAULT 0,
  create_time TIMESTAMP DEFAULT now(),
  update_time TIMESTAMP DEFAULT now()
);

INSERT INTO Meta_Version (name) values('Folder');



