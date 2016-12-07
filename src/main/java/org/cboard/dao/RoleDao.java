package org.cboard.dao;

import org.cboard.pojo.DashboardRole;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by yfyuan on 2016/12/6.
 */
@Repository
public interface RoleDao {
    int save(DashboardRole role);

    List<DashboardRole> getRoleList();

    int update(DashboardRole role);
}
