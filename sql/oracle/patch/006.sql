CREATE TABLE dashboard_homepage (
  board_id NUMBER NOT NULL,
  user_id varchar2(50) NOT NULL,
  CONSTRAINT dashboard_homepage_pk PRIMARY KEY (board_id, user_id)
);