package org.cboard.exception;

/**
 * Created by zyong on 2017/1/24.
 */
public class CBoardException extends RuntimeException {

    public CBoardException(String message) {
        super(message);
    }

    public CBoardException(String message, Throwable cause) {
        super(message, cause);
    }
}
