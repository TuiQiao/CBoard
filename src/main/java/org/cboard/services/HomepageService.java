package org.cboard.services;

import org.cboard.dao.HomepageDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;


/**
 * Created by february on 2018/12/20.
 */
@Repository
public class HomepageService {

    private Logger LOG = LoggerFactory.getLogger(this.getClass());
    
    @Autowired
    private HomepageDao homepageDao;
    
    public ServiceStatus resetHomepage(String userId) {
        try {
            homepageDao.resetHomepage(userId);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } catch (Exception e) {
            LOG.error("", e);
            return new ServiceStatus(ServiceStatus.Status.Fail, e.getMessage());
        }
    }
    
    public Long selectHomepage(String userId) {
        Long boardId = homepageDao.selectHomepage(userId);
        return boardId;
    }
    
    public ServiceStatus saveHomepage(Long boardId, String userId) {
        try {
            homepageDao.resetHomepage(userId);
            homepageDao.saveHomepage(boardId, userId);
            return new ServiceStatus(ServiceStatus.Status.Success, "success");
        } catch (Exception e) {
            LOG.error("", e);
            return new ServiceStatus(ServiceStatus.Status.Fail, e.getMessage());
        }
    }

}
