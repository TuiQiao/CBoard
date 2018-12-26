CREATE TABLE dashboard_homepage (
  board_id bigint identity(1,1),
  user_id varchar(50) NOT NULL,
  PRIMARY KEY CLUSTERED (board_id, user_id)
);