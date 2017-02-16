package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.cboard.services.persist.excel.XlsProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by yfyuan on 2017/2/10.
 */
@Service
public class MailService {

    @Autowired
    private XlsProcessService xlsProcessService;

    @Autowired
    private PersistService persistService;

    public String test() {
        persistService.persist(8L, this::persistMail);
        return null;
    }

    public String persistMail(Long dashboardId, JSONObject data) {
        xlsProcessService.dashboardToXls(dashboardId, data);
        return null;
    }
}
