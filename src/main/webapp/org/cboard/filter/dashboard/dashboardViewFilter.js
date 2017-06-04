/**
 * Created by zyong on 2017/4/28.
 */
cBoard.filter('hasBoards', function () {
    return function(category, boardlist) {
        if (boardlist == undefined) return boardlist;
        var cids = boardlist.map(function (b) {
            return b.categoryId;
        });
        var result = _.filter(category, function (c) {
            return _.contains(cids, c.id);
        });
        return result;
    };
});