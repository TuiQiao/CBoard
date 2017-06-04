/**
 * Created by yfyuan on 2016/8/2.
 */
'use strict';
cBoard.controller('boardCtrl', function ($rootScope, $scope, $http, ModalUtils, $filter, updateService, $uibModal, $timeout, dataService, $state, $window) {
    var translate = $filter('translate');

    $scope.optFlag = 'none';
    $scope.curBoard = {layout: {rows: []}};
    $scope.alerts = [];
    $scope.verify = {boardName: true};
    $rootScope.freeLayout = false;
    $scope.treeData = [];

    var treeID = "boardTreeID";
    var originalData = [];
    var updateUrl = "dashboard/updateBoard.do";

    var getBoardList = function () {
        $http.get("dashboard/getBoardList.do").success(function (response) {
            $scope.boardList = response;
            originalData = jstree_CvtVPath2TreeData(
                $scope.boardList.map(function (ds) {
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
        $http.get("dashboard/getCategoryList.do").success(function (response) {
            $scope.categoryList = [{id: null, name: translate('CONFIG.DASHBOARD.MY_DASHBOARD')}];
            _.each(response, function (o) {
                $scope.categoryList.push(o);
            });
        });
    };

    var getDatasetList = function () {
        $http.get("dashboard/getDatasetList.do")
            .then(function (response) {
                $scope.datasetList = response.data;
                return $http.get("dashboard/getWidgetList.do");
            })
            .then(function (response) {
                    $scope.widgetList = response.data;
                    $scope.widgetList = $scope.widgetList.map(function (w) {
                        if (w.data.datasetId != null) {
                            var dataset = _.find($scope.datasetList, function (ds) {
                                return ds.id == w.data.datasetId;
                            });
                            w.dataset = dataset == null ? 'Lost DataSet' : dataset.name;
                        } else {
                            w.dataset = "Query";
                        }
                        return w;
                    });
                }
            );
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
            dataService.getColumns({
                datasource: null,
                query: null,
                datasetId: d,
                callback: function (dps) {
                    $scope.alerts = [];
                    if (dps.msg == "1") {
                        var dataset = _.find($scope.datasetList, function (ds) {
                            return ds.id == d;
                        });
                        if (dataset != undefined) {
                            $scope.boardDataset.push({name: dataset.name, columns: dps.columns, datasetId: dataset.id});
                        }
                        status.i--;
                    } else {
                        $scope.alerts = [{msg: dps.msg, type: 'danger'}];
                    }
                }
            });
        });
        _.each(widgetArr, function (w) {
            status.i++;
            dataService.getColumns({
                datasource: w.data.datasource,
                query: w.data.query,
                datasetId: null,
                callback: function (dps) {
                    if (dps.msg == "1") {
                        $scope.boardDataset.push({name: w.name, columns: dps.columns, widgetId: w.id});
                        status.i--;
                    } else {
                        $scope.alerts = [{msg: dps.msg, type: 'danger'}];
                    }

                }
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

    $scope.newOperate = function () {
        $('div.newBoard').toggleClass('hideOperate');
    };

    $scope.newGridLayout = function () {
        $rootScope.freeLayout = false;
        $scope.optFlag = 'new';
        $scope.curBoard = {layout: {rows: []}};
        $('div.newBoard').addClass('hideOperate');
    };

    $scope.newTimelineLayout = function () {
        $rootScope.freeLayout = false;
        $scope.optFlag = 'new';
        $scope.curBoard = {
            layout: {
                type: 'timeline', rows: [{
                    height: '',
                    params: [],
                    type: 'param'
                }]
            }
        };
        $('div.newBoard').addClass('hideOperate');
    };

    $scope.newFreeLayout = function () {
        $rootScope.freeLayout = true;
        $('div.newBoard').addClass('hideOperate');
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
        $http.post("dashboard/saveNewBoard.do", {json: angular.toJson(o)}).success(saveBoardCallBack);
    };

    $scope.deleteBoard = function (board) {
        ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg", function () {
            $http.post("dashboard/deleteBoard.do", {id: board.id}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getBoardList();
                    boardChange();
                    ModalUtils.alert(serviceStatus.msg, "modal-success", "sm");
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
                $scope.optFlag == 'none';
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

    $scope.addNode = function (node) {
        $scope.curBoard.layout.rows.push({node: node, type: 'widget', widgets: []});
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
    };

    function saveBoardCallBack(serviceStatus) {
        if (serviceStatus.status == '1') {
            getBoardList();
            if (!$scope.curBoard.id) {
                $scope.curBoard.id = serviceStatus.id;
            }
            $scope.optFlag = 'edit';
            ModalUtils.alert(serviceStatus.msg, "modal-success", "sm");
            boardChange();
        } else {
            ModalUtils.alert(serviceStatus.msg, "modal-warning", "sm");
        }
    }

    $scope.checkBeforPreview = function (Id) {
        $scope.isPreview = true;
        ModalUtils.confirm(translate("COMMON.CONFIRM_SAVE_BEFORE_PREVIEW"), "modal-warning", "lg", function () {
            var newTab = $window.open('', '_blank');
            $scope.saveBoard()
                .then(function () {
                    if (!Id) {
                        Id = $scope.curBoard.id;
                    }
                    var url = $state.href('mine.view', {id: Id});
                    newTab.location.href = url;
                });
        });
    };
    $scope.saveBoard = function () {
        if (!validate()) {
            return;
        }
        if ($scope.optFlag == 'new') {
            return $http.post("dashboard/saveNewBoard.do", {json: angular.toJson($scope.curBoard)}).success(saveBoardCallBack);
        } else if ($scope.optFlag == 'edit') {
            return $http.post(updateUrl, {json: angular.toJson($scope.curBoard)}).success(saveBoardCallBack);
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
            templateUrl: 'org/cboard/view/config/board/modal/param.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            controller: function ($scope, $uibModalInstance) {
                $scope.param_types = [
                    {name: 'selector', value: 'selector'},
                    {name: 'slider', value: 'slider'}
                ];
                $scope.status = status;
                $scope.param = param;
                if (!$scope.param.paramType) {
                    $scope.param.paramType = 'selector';
                }
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
    $scope.treeConfig = angular.copy(jsTreeConfig1);
    $scope.treeConfig.plugins = ['types', 'unique', 'state', 'sort'];

    $("#" + treeID).keyup(function (e) {
        if (e.keyCode == 46) {
            $scope.deleteBoard(getSelectedBoard());
        }
    });

    var getSelectedBoard = function () {
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];
        return _.find($scope.boardList, function (ds) {
            return ds.id == selectedNode.id;
        });
    };

    var checkTreeNode = function (actionType) {
        return jstree_CheckTreeNode(actionType, treeID, ModalUtils.alert);
    };

    var switchNode = function (id) {
        $scope.ignoreChanges = false;
        var dataSetTree = jstree_GetWholeTree(treeID);
        dataSetTree.deselect_all();
        dataSetTree.select_node(id);
    };

    $scope.applyModelChanges = function () {
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

    $scope.deleteNode = function () {
        if (!checkTreeNode("delete")) return;
        $scope.deleteBoard(getSelectedBoard());
    };

    $scope.treeEventsObj = function () {
        var baseEventObj = jstree_baseTreeEventsObj({
            ngScope: $scope, ngHttp: $http, ngTimeout: $timeout,
            treeID: treeID, listName: "boardList"
            //, updateUrl: updateUrl
        });
        return baseEventObj;
    }();
    /**  js tree related start **/
});