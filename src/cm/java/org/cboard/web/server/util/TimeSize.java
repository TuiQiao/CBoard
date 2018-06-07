package org.cboard.web.server.util;

class TimeSize {
    final long time;
    final long size;

    public TimeSize(long time, long size) {
        this.time = time;
        this.size = size;
    }

    public int hashCode() {
        return (int)(this.time ^ this.size);
    }

    public boolean equals(Object o) {
        if(!(o instanceof TimeSize)) {
            return false;
        } else {
            TimeSize ts = (TimeSize)o;
            return ts.time == this.time && ts.size == this.size;
        }
    }

    public String toString() {
        return "[t=" + this.time + ", s=" + this.size + "]";
    }
}
