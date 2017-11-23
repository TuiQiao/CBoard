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


//    public ServiceStatus update(String json) {
//        JSONObject jsonObject = JSONObject.parseObject(json);
//        MaidenVersion version = new MaidenVersion();
//        version.setName(jsonObject.getString("name"));
//        version.setstatus(jsonObject.getInteger("status"));
//        version.setUpdateTime(new Timestamp(Calendar.getInstance().getTimeInMillis()));
//
//        if (versionDao.countExistVersionName(version.getName()) <= 0) {
//            versionDao.update(version);
//            return new ServiceStatus(ServiceStatus.Status.Success, "success");
//        } else {
//            return new ServiceStatus(ServiceStatus.Status.Fail, "Duplicated name");
//        }
//    }
//
//    public ServiceStatus delete(int id) {
//        try {
//            versionDao.delete(id);
//            return new ServiceStatus(ServiceStatus.Status.Success, "success");
//        } catch (Exception e) {
//            LOG.error("", e);
//            return new ServiceStatus(ServiceStatus.Status.Fail, e.getMessage());
//        }
//    }
}
