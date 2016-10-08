package org.cboard.services;

/**
 * Created by zyong on 2016/9/26.
 */
public class ServiceStatus {

    private Status status;
    private String msg;

    public ServiceStatus(Status status, String msg) {
        this.status = status;
        this.msg = msg;
    }

    enum Status {

        Success(1), Fail(2);

        private int status;

        Status(int status) {
            this.status = status;
        }

        public int getStatus() {
            return status;
        }

        public String toString() {
            return  new Integer(this.status).toString();
        }
    }

    public String getStatus() {
        return status.toString();
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}
