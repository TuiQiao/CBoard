package org.cboard.services.meta;


import org.cboard.dao.MetaVersionDao;
import org.cboard.services.PersistService;
import org.cboard.services.persist.excel.XlsProcessService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;


/**
 * Created by jx_luo on 2017/11/10.
 */
@Repository
public class MetaVersionService {

    private Logger LOG = LoggerFactory.getLogger(this.getClass());
    @Autowired
    private MetaVersionDao versionDao;

    @Autowired
    private PersistService persistService;

    @Autowired
    private XlsProcessService xlsProcessService;

}
