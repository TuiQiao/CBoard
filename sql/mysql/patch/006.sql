-- Real folder
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

-- Root Folder
INSERT INTO dashboard_folder (folder_id,folder_name,parent_id) VALUES (10000, 'Root', -1);
-- Private Folder
INSERT INTO dashboard_folder (folder_name, parent_id, is_private) VALUES ('.private', 10000, 1);
-- Dashboard Category Folder
INSERT INTO dashboard_folder (folder_name, parent_id) SELECT category_name, 10000 FROM dashboard_category;

ALTER TABLE dashboard_dataset ADD COLUMN folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_widget  ADD COLUMN folder_id INT DEFAULT 10000;
ALTER TABLE dashboard_board   ADD COLUMN folder_id INT DEFAULT 10000;

-- Update board folder
UPDATE dashboard_board a
  JOIN dashboard_category c ON a.category_id = c.category_id
  JOIN dashboard_folder f   ON c.category_name = f.folder_name AND f.parent_id=10000
   SET a.folder_id = f.folder_id;

UPDATE dashboard_board a
SET a.folder_id = (SELECT folder_id FROM dashboard_folder WHERE folder_name = '.private' AND parent_id=10000)
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

INSERT INTO Meta_Version (name) VALUES ('Folder');
