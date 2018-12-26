package org.cboard.dao;

import org.cboard.pojo.DashboardCategory;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Created by yfyuan on 2016/8/26.
 */
@Repository
public interface CategoryDao {

    List<DashboardCategory> getCategoryList();

    int save(DashboardCategory dashboardCategory);

    long countExistCategoryName(Map<String, Object> map);

    int update(DashboardCategory dashboardCategory);

    int delete(Long id);
}
