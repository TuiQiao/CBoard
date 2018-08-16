package org.cboard.dao;

import org.apache.ibatis.annotations.Param;
import org.cboard.pojo.DashboardBoard;
import org.cboard.pojo.DashboardBoardParam;
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

    List<DashboardBoard> getBoardListAdmin(String userId);

    long countExistBoardName(Map<String, Object> map);

    int update(DashboardBoard board);

    int delete(@Param("id") Long id, @Param("userId") String userId);

    DashboardBoard getBoard(Long id);

    long checkBoardRole(@Param("userId") String userId, @Param("boardId") Long boardId, @Param("permissionPattern") String permissionPattern);

    DashboardBoardParam getBoardParam(@Param("boardId") Long boardId, @Param("userId") String userId);

    int saveBoardParam(DashboardBoardParam boardParam);

    int deleteBoardParam(@Param("boardId") Long boardId, @Param("userId") String userId);
}
