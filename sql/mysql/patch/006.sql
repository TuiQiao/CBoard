CREATE TABLE dashboard_homepage (
  board_id bigint(20) NOT NULL,
  user_id varchar(50) NOT NULL,
  PRIMARY KEY (board_id, user_id)
);