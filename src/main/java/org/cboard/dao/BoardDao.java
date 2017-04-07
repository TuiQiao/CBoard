package org.cboard.dao;

import org.cboard.pojo.DashboardBoard;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Created by yfyuan on 2016/8/23.
 */
@Repository
public interface BoardDao {

    int save(DashboardBoard board);

    List<DashboardBoard> getBoardList(String userId);

    long countExistBoardName(Map<String, Object> map);

    int update(DashboardBoard board);

    int delete(Long id, String userId);

    DashboardBoard getBoard(Long id);

    long checkBoardRole(String userId, Long boardId, String permissionPattern);
}
