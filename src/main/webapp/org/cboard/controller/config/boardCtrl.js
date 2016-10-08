/**
 * Created by yfyuan on 2016/8/2.
 */

cBoard.controller('boardCtrl', function ($scope, $http, ModalUtils) {

    $scope.optFlag = 'none';
    $scope.curBoard = {layout: {rows: []}};

    var getBoardList = function () {
        $http.get("/dashboard/getBoardList.do").success(function (response) {
            $scope.boardList = response;
        });
    };

    var getWidgetList = function () {
        $http.get("/dashboard/getWidgetList.do").success(function (response) {
            $scope.widgetList = response;
        });
    };

    var getCategoryList = function () {
        $http.get("/dashboard/getCategoryList.do").success(function (response) {
            $scope.categoryList = [{id: null, name: '个人看板'}];
            _.each(response, function (o) {
                $scope.categoryList.push(o);
            })
        });
    };

    var boardChange = function () {
        $scope.$emit("boardChange");
    };

    getBoardList();
    getWidgetList();
    getCategoryList();

    $scope.widgetGroup = function (item) {
        return item.categoryName;
    }

    $scope.newBoard = function () {
        $scope.optFlag = 'new';
        $scope.curBoard = {layout: {rows: []}};
    };

    $scope.addWidget = function (row) {
        var w = {};
        w.name = '图表名称';
        w.width = 12;
        w.widgetId = $scope.widgetList[0].id;
        row.widgets.push(w);
    };

    $scope.addRow = function () {
        $scope.curBoard.layout.rows.push({widgets: []})
    };

    $scope.saveBoard = function () {
        if ($scope.optFlag == 'new') {
            $http.post("/dashboard/saveNewBoard.do", {json: angular.toJson($scope.curBoard)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getBoardList();
                    $scope.optFlag = 'none';
                    ModalUtils.alert(serviceStatus.msg, "modal-success", "sm");
                    boardChange();
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        } else if ($scope.optFlag == 'edit') {
            $http.post("/dashboard/updateBoard.do", {json: angular.toJson($scope.curBoard)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getBoardList();
                    $scope.optFlag = 'none';
                    ModalUtils.alert(serviceStatus.msg, "modal-success", "sm");
                    boardChange();
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        }
    };

    $scope.editBoard = function (board) {
        $scope.curBoard = angular.copy(board);
        $scope.optFlag = 'edit';
    };

    $scope.deleteBoard = function (board) {
        ModalUtils.confirm("确认删除吗？", "modal-warning", "lg", function () {
            $http.post("/dashboard/deleteBoard.do", {id: board.id}).success(function () {
                getBoardList();
                $scope.optFlag == 'none';
                boardChange();
            });
        });
    };

});