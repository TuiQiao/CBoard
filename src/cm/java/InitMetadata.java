package org.cboard;

import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * Created by JunjieM on 2018-4-2.
 */
public class InitMetadata {

    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(
                new String[] { "classpath:spring-init-metadata.xml" });
        context.start();
        System.out.println("初始化元数据成功!");
    }
}
