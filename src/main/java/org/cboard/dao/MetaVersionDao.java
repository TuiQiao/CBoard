package org.cboard.dao;

import org.cboard.pojo.MetaVersion;
import org.springframework.stereotype.Repository;

/**
 * Created by jx_luo on 2017/11/10.
 */
@Repository
public interface MetaVersionDao {

    int update(MetaVersion version);

    int delete(int id);

    MetaVersion getMetaVersion(String name);

    Long countExistVersionName(String name);
}
