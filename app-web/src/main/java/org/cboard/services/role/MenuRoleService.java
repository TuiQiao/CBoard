package org.cboard.services.role;

import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.cboard.dao.MenuDao;
import org.cboard.dto.DashboardMenu;
import org.cboard.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by yfyuan on 2016/12/21.
 */
@Repository
@Aspect
public class MenuRoleService {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private MenuDao menuDao;

    @Value("${admin_user_id}")
    private String adminUserId;

    @Around("execution(* org.cboard.services.MenuService.getMenuList(..))")
    public Object getMenuList(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String userid = authenticationService.getCurrentUser().getUserId();
        if (userid.equals(adminUserId)) {
            return proceedingJoinPoint.proceed();
        } else {
            final List<Long> menuIdList = menuDao.getMenuIdByUserRole(userid);
            List<DashboardMenu> list = (List<DashboardMenu>) proceedingJoinPoint.proceed();
            return new ArrayList<DashboardMenu>(Collections2.filter(list, new Predicate<DashboardMenu>() {
                @Override
                public boolean apply(@Nullable DashboardMenu dashboardMenu) {
                    return menuIdList.contains(dashboardMenu.getMenuId());
                }
            }));
        }
    }

}
