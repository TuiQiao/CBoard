/**
 * Created by yfyuan on 2016/8/2.
 */
'use strict';
cBoard.controller('boardCtrl', function ($scope, $http, ModalUtils, $filter, updateService, $uibModal) {

    var translate = $filter('translate');

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
            $scope.categoryList = [{id: null, name: translate('CONFIG.DASHBOARD.MY_DASHBOARD')}];
            _.each(response, function (o) {
                $scope.categoryList.push(o);
            })
        });
    };

    var getDatasetList = function () {
        $http.get("/dashboard/getDatasetList.do").success(function (response) {
            $scope.datasetList = response;
        });
    };

    var loadBoardDataset = function (status) {
        var datasetIdArr = [];
        var widgetArr = [];
        _.each($scope.curBoard.layout.rows, function (row) {
            _.each(row.widgets, function (widget) {
                var w = _.find($scope.widgetList, function (w) {
                    return w.id == widget.widgetId
                });
                if (w.data.datasetId) {
                    datasetIdArr.push(w.data.datasetId);
                } else {
                    widgetArr.push(w);
                }
            });
        });
        datasetIdArr = _.union(datasetIdArr);
        $scope.boardDataset = [];
        _.each(datasetIdArr, function (d) {
            status.i++;
            $http.post("/dashboard/getCachedData.do", {
                datasetId: d,
            }).success(function (response) {
                var dataset = _.find($scope.datasetList, function (ds) {
                    return ds.id == d;
                });
                $scope.boardDataset.push({name: dataset.name, columns: response.data[0], datasetId: dataset.id});
                status.i--;
            });
        });
        _.each(widgetArr, function (w) {
            status.i++;
            $http.post("/dashboard/getCachedData.do", {
                datasourceId: w.data.datasource,
                query: angular.toJson(w.data.query),
            }).success(function (response) {
                $scope.boardDataset.push({name: w.name, columns: response.data[0], widgetId: w.id});
                status.i--;
            });
        });
    };

    var boardChange = function () {
        $scope.$emit("boardChange");
    };

    getBoardList();
    getWidgetList();
    getCategoryList();
    getDatasetList();

    $scope.widgetGroup = function (item) {
        return item.categoryName;
    };

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
        $scope.curBoard.layout.rows.push({type: 'widget', widgets: []});
    };

    $scope.addPramRow = function () {
        $scope.curBoard.layout.rows.push({type: 'param', params: []});
    };

    $scope.saveBoard = function () {
        if ($scope.optFlag == 'new') {
            $http.post("/dashboard/saveNewBoard.do", {json: angular.toJson($scope.curBoard)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getBoardList();
                    $scope.optFlag = 'edit';
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
                    $scope.optFlag = 'edit';
                    ModalUtils.alert(serviceStatus.msg, "modal-success", "sm");
                    boardChange();
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        }
    };

    $scope.editBoard = function (board) {
        var b = angular.copy(board);
        updateService.updateBoard(b);
        $scope.curBoard = b;
        $scope.optFlag = 'edit';
    };

    $scope.deleteBoard = function (board) {
        ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg", function () {
            $http.post("/dashboard/deleteBoard.do", {id: board.id}).success(function () {
                getBoardList();
                $scope.optFlag == 'none';
                boardChange();
            });
        });
    };

    $scope.editParam = function (row, index) {
        var status = {i: 0};
        loadBoardDataset(status);
        var parent = $scope;
        var ok;
        var param;
        if (_.isUndefined(index)) {
            param = {col: []};
            ok = function (p) {
                if (!row.params) {
                    row.params = [];
                }
                row.params.push(p);
            };
        } else {
            param = angular.copy(row.params[index]);
            ok = function (p) {
                row.params[index] = p;
            };
        }
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/param.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            controller: function ($scope, $uibModalInstance) {
                $scope.status = status;
                $scope.param = param;
                $scope.boardDataset = parent.boardDataset;
                $scope.add = function (selectedDataset, column) {
                    var v = angular.copy(selectedDataset);
                    delete v.columns;
                    v.column = column;
                    $scope.param.col.push(v);
                };
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.ok = function () {
                    ok($scope.param);
                    $uibModalInstance.close();
                };
                $scope.foldCube = function(cube, e) {
                    var node= e.target.parentNode;
                    var imgNode=node.getElementsByTagName("img");
                    if(e.target.className == "cubeName ng-binding") {
                        if(node.style.height=="25px"||node.style.height==""){
                            node.style.height=25*(cube.columns.length+1)+"px";
                            imgNode[0].style.webkitTransform="rotate(90deg)";
                        }else{
                            node.style.height="25px";
                            imgNode[0].style.webkitTransform="rotate(0deg)";
                        }
                    }
                }
            }
        });
    };

});