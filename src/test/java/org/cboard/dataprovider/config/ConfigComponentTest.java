package org.cboard.dataprovider.config;

import static org.junit.Assert.*;

/**
 * Created by zyong on 2017/4/24.
 */
public class ConfigComponentTest {


    public void testDrider() {
        ConfigComponent cc1 = new CompositeConfig();
        cc1.add(new CompositeConfig());
        cc1.add(new DimensionConfig());

        ConfigComponent cc = new CompositeConfig();
        cc.add(cc1);
        cc.add(new DimensionConfig());
    }
}