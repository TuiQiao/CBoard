package org.cboard.services.meta;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.cboard.dao.BoardDao;
import org.cboard.dao.MaidenVersionDao;
import org.cboard.dao.WidgetDao;
import org.cboard.dto.ViewDashboardBoard;
import org.cboard.dto.ViewDashboardWidget;
import org.cboard.pojo.DashboardBoard;
import org.cboard.pojo.DashboardWidget;
import org.cboard.pojo.MaidenVersion;
import org.cboard.services.PersistService;
import org.cboard.services.ServiceStatus;
import org.cboard.services.persist.excel.XlsProcessService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by jx_luo on 2017/11/10.
 */
@Repository
public class MaidenVersionService {

    private Logger LOG = LoggerFactory.getLogger(this.getClass());
    @Autowired
    private MaidenVersionDao versionDao;

    @Autowired
    private PersistService persistService;

    @Autowired
    private XlsProcessService xlsProcessService;

}
