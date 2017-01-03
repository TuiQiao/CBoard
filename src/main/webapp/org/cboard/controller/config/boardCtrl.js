/**
 * Created by yfyuan on 2016/8/2.
 */
'use strict';
cBoard.controller('boardCtrl', function ($scope, $http, ModalUtils, $filter, updateService, $uibModal, $timeout) {

    var translate = $filter('translate');

    $scope.optFlag = 'none';
    $scope.curBoard = {layout: {rows: []}};
    $scope.alerts = [];
    $scope.verify = {boardName: true};

    $scope.treeData = [];
    var treeID = "boardTreeID";
    var originalData = [];

    var getBoardList = function () {
        $http.get("/dashboard/getBoardList.do").success(function (response) {
            $scope.boardList = response;
            originalData = jstree_CvtVPath2TreeData(
                $scope.boardList.map(function(ds) {
                    var categoryName = ds.categoryName == null ? translate('CONFIG.DASHBOARD.MY_DASHBOARD') : ds.categoryName;
                    return {
                        "id": ds.id,
                        "name": ds.name,
                        "categoryName": categoryName
                    };
                })
            );
            jstree_ReloadTree(treeID, originalData);
        });
    };

    var getCategoryList = function () {
        $http.get("/dashboard/getCategoryList.do").success(function (response) {
            $scope.categoryList = [{id: null, name: translate('CONFIG.DASHBOARD.MY_DASHBOARD')}];
            _.each(response, function (o) {
                $scope.categoryList.push(o);
            });
        });
    };

    var getDatasetList = function () {
        $http.get("/dashboard/getDatasetList.do").success(function (response) {
            $scope.datasetList = response;
        }).then ($http.get("/dashboard/getWidgetList.do").success(function (response) {
            $scope.widgetList = response;
            $scope.widgetList = $scope.widgetList.map(function(w) {
                if (w.data.datasetId != null) {
                    var dataset = _.find($scope.datasetList, function (ds) { return ds.id == w.data.datasetId; });
                    w.dataset = dataset == null ? 'Lost DataSet' : dataset.name;
                } else {
                    w.dataset = "Query";
                }
                return w;
            });
        }));
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
                datasetId: d
            }).success(function (response) {
                var dataset = _.find($scope.datasetList, function (ds) {
                    return ds.id == d;
                });
                if (dataset != undefined) {
                    $scope.boardDataset.push({name: dataset.name, columns: response.data[0], datasetId: dataset.id});
                }
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
        $scope.verify = {boardName: true};
        $scope.$emit("boardChange");
    };

    getBoardList();
    getCategoryList();
    getDatasetList();

    $scope.newBoard = function () {
        $scope.optFlag = 'new';
        $scope.curBoard = {layout: {rows: []}};
    };

    $scope.editBoard = function (board) {
        var b = angular.copy(board);
        updateService.updateBoard(b);
        $scope.curBoard = b;
        $scope.optFlag = 'edit';
    };

    $scope.copyBoard = function (board) {
        var o = angular.copy(board);
        o.name = o.name + '_copy';
        $http.post("/dashboard/saveNewBoard.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                getBoardList();
                ModalUtils.alert(serviceStatus.msg, "modal-success", "sm");
                boardChange();
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
        });
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

    $scope.widgetGroup = function (item) {
        return item.categoryName;
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
        $scope.curBoard.layout.rows.unshift({type: 'param', params: []});
    };

    var validate = function () {
        $scope.alerts = [];
        if (!$scope.curBoard.name) {
            $scope.alerts = [{msg: translate('CONFIG.DASHBOARD.NAME') + translate('COMMON.NOT_EMPTY'), type: 'danger'}];
            $scope.verify = {boardName: false};
            $("#BoardName").focus();
            return false;
        }
        return true;
    }

    $scope.saveBoard = function () {
        if (!validate()) {
            return;
        }
        if ($scope.optFlag == 'new') {
            $http.post("/dashboard/saveNewBoard.do", {json: angular.toJson($scope.curBoard)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getBoardList();
                    $scope.optFlag = 'edit';
                    ModalUtils.alert(serviceStatus.msg, "modal-success", "sm");
                    boardChange();
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
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
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        }
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
                    var paramCol = $scope.param.col;
                    var haveCol = null;
                    for (var i = 0; i < paramCol.length; i++) {
                        (paramCol[i].column == v.column && paramCol[i].name == v.name) ? haveCol = true : null;
                    }
                    (!haveCol || $scope.param.col == []) ? $scope.param.col.push(v) : null;
                };
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.deleteSelected = function (index) {
                    var select = $scope.param.col[index].column;
                    var nodes = $('.cube>span');
                    for (var i = 0; i < nodes.length; i++) {
                        if (($(nodes[i]))[0].innerText == select) {
                            $(nodes[i]).removeClass('itemSelected');
                        }
                    }
                    $scope.param.col.splice(index, 1);
                };
                $scope.ok = function () {
                    if ($scope.param.name) {
                        ok($scope.param);
                        $uibModalInstance.close();
                    } else {
                        ModalUtils.alert('Please fill out the information', "modal-warning", "lg");
                    }
                };
                $scope.foldCube = function (cube, e) {
                    var node = (e.target.localName == 'img') ? e.target.parentNode.parentNode : e.target.parentNode;
                    var imgNode = node.getElementsByTagName("img");
                    if (e.target.className == "cubeName ng-binding" || e.target.localName == 'img') {
                        if (node.style.height == "25px" || node.style.height == "") {
                            node.style.height = 25 * (cube.columns.length + 1) + "px";
                            imgNode[0].style.webkitTransform = "rotate(90deg)";
                        } else {
                            node.style.height = "25px";
                            imgNode[0].style.webkitTransform = "rotate(0deg)";
                        }
                    } else if ($(e.target)[0].localName == 'span') {
                        $(e.target).addClass('itemSelected');
                    }
                    $scope.param.col.map(function (d) {
                        var columnSelect = d.column;
                        var cubeName = d.name;
                        var nodeList = $('.cube>span');
                        for (var i = 0; i < nodeList.length; i++) {
                            var name = nodeList[i].parentNode.firstElementChild.innerText;
                            if (($(nodeList[i]))[0].innerText == columnSelect && cubeName == name) {
                                $(nodeList[i]).addClass('itemSelected');
                            }
                        }
                    });
                };
            }
        });
    };


    /**  js tree related start **/
    $scope.treeConfig = jsTreeConfig1;

    $("#" + treeID).keyup(function(e){
        if(e.keyCode == 46) {
            $scope.deleteBoard();
        }
    });

    var getSelectedBoard = function() {
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];
        return _.find($scope.boardList, function (ds) { return ds.id == selectedNode.id; });
    };

    var checkTreeNode = function(actionType) {
        return jstree_CheckTreeNode(actionType, treeID, ModalUtils.alert);
    };

    var switchNode = function (id) {
        $scope.ignoreChanges = false;
        var dataSetTree = jstree_GetWholeTree(treeID);
        dataSetTree.deselect_all();
        dataSetTree.select_node(id);
    };

    $scope.applyModelChanges = function() {
        return !$scope.ignoreChanges;
    };

    $scope.copyNode = function () {
        if (!checkTreeNode("copy")) return;
        $scope.copyBoard(getSelectedBoard());
    };

    $scope.editNode = function () {
        if (!checkTreeNode("edit")) return;
        $scope.editBoard(getSelectedBoard());
    };

    $scope.deleteNode = function(){
        if (!checkTreeNode("delete")) return;
        $scope.deleteBoard(getSelectedBoard());
    };

    $scope.treeEventsObj = function() {
        return jstree_baseTreeEventsObj(treeID, $scope, $timeout);
    }();

    /**  js tree related start **/
});