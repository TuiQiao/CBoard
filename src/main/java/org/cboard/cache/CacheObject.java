package org.cboard.cache;

import com.caucho.hessian.io.Hessian2Input;
import com.caucho.hessian.io.Hessian2Output;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.Serializable;

/**
 * Created by yfyuan on 2017/2/4.
 */
public class CacheObject implements Serializable {
    private long t1;
    private long expire;
    private byte[] d;

    public CacheObject(long t1, long expire, Object d) {
        this.t1 = t1;
        this.expire = expire;
        if (d != null) {
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            Hessian2Output ho = new Hessian2Output(os);
            try {
                ho.startMessage();
                ho.writeObject(d);
                ho.completeMessage();
                ho.close();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            this.d = os.toByteArray();
        }
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
        if (d != null) {
            ByteArrayInputStream is = new ByteArrayInputStream(d);
            Hessian2Input hi = new Hessian2Input(is);
            try {
                hi.startMessage();
                Object o = hi.readObject();
                hi.completeMessage();
                hi.close();
                return o;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return d;
    }

}
