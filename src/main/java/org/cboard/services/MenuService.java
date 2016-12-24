package org.cboard.services;

import org.cboard.dto.DashboardMenu;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by yfyuan on 2016/12/21.
 */
@Repository
public class MenuService {

    private static List<DashboardMenu> menuList = new ArrayList<>();

    static {
        menuList.add(new DashboardMenu(1, -1, "配置", "config"));
        menuList.add(new DashboardMenu(2, 1, "数据源配置", "config.datasource"));
        menuList.add(new DashboardMenu(3, 1, "数据集配置", "config.dataset"));
        menuList.add(new DashboardMenu(4, 1, "图表配置", "config.widget"));
        menuList.add(new DashboardMenu(5, 1, "看板配置", "config.board"));
        menuList.add(new DashboardMenu(6, 1, "看板分类配置", "config.category"));
        menuList.add(new DashboardMenu(7, -1, "管理", "admin"));
        menuList.add(new DashboardMenu(8, 7, "用户管理", "admin.user"));
        menuList.add(new DashboardMenu(9, 7, "资源管理", "admin.res"));
    }

    public List<DashboardMenu> getMenuList() {
        return menuList;
    }
}
