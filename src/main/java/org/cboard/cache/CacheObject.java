package org.cboard.cache;

import java.io.Serializable;

/**
 * Created by yfyuan on 2017/2/4.
 */
public class CacheObject implements Serializable {
    private long t1;
    private long expire;
    private Object d;

    public CacheObject(long t1, long expire, Object d) {
        this.t1 = t1;
        this.expire = expire;
        this.d = d;
    }

    public long getT1() {
        return t1;
    }

    public void setT1(long t1) {
        this.t1 = t1;
    }

    public long getExpire() {
        return expire;
    }

    public void setExpire(long expire) {
        this.expire = expire;
    }

    public Object getD() {
        return d;
    }

    public void setD(Object d) {
        this.d = d;
    }
}
