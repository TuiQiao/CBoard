package org.cboard.dataprovider.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by yfyuan on 2016/8/18.
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface QueryParameter {
    String label();

    Type type();

    int order() default 0;

    enum Type {
        Input("input"), TextArea("textarea");
        private String name;

        Type(String name) {
            this.name = name;
        }

        public String toString() {
            return this.name;
        }

    }
}
