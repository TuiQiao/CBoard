package org.cboard.services;

import org.junit.Assert;
import org.junit.Test;

/**
 * Created by zyong on 2016/9/26.
 */
public class ServiceStatusTest {

    @Test
    public void testServiceStatus() {
        ServiceStatus success = new ServiceStatus(ServiceStatus.Status.Success, "Success");
        Assert.assertTrue("Status", success.getStatus().equals("1"));
    }

}
