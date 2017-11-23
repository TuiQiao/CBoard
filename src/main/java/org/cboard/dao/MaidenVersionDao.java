package org.cboard.dao;

import org.cboard.pojo.MaidenVersion;
import org.springframework.stereotype.Repository;

/**
 * Created by jx_luo on 2017/11/10.
 */
@Repository
public interface MaidenVersionDao {

    int update(MaidenVersion version);

    int delete(int id);

    MaidenVersion getMaidenVersion(String name);

    Long countExistVersionName(String name);
}
