/**
 * Created by yfyuan on 2016/8/2.
 */
'use strict';
cBoard.controller('boardCtrl',
    function ($rootScope, $scope, $http, ModalUtils, $filter, updateService, $uibModal,
              $timeout, dataService, $state, $window, $stateParams) {
    var translate = $filter('translate');

    $scope.curBoard = {layout: {rows: []}};
    $scope.alerts = [];
    $scope.verify = {boardName: true};
    $rootScope.freeLayout = false;
    $scope.treeData = [];

    $scope.folderData = [];
    $scope.openFolder = false;
    $scope.selectedFold = {};
    $scope.showBox = false;
    $scope.folderIds = [];
    $scope.privateFolder = {};
    
    var treeID = "boardTreeID";
    var originalData = [];
    var updateUrl = "dashboard/updateBoard.do";
    var deleteUrl = "dashboard/deleteBoard.do";

    var getPrivateFolder = function () {
        $http.post('dashboard/getFolder.do', {parentId: 10000, name: ".private"}).success(function (response) {
            $scope.privateFolder = response;
        });
    };
    getPrivateFolder();

    $scope.getFolderList = function () {
        $http.post('dashboard/getFolderFamilyTree.do', {folderIds: $scope.folderIds}).success(function (response) {
            $scope.folderList = response;

            $scope.folderData = [];
            for (var i=0; i<$scope.folderList.length; i++){
                var folderName = $scope.folderList[i].name.toString();
                if($scope.folderList[i].parentId == 10000 || $scope.folderList[i].id == 10000) {
                    $scope.folderData.push({
                        "id": $scope.folderList[i].id.toString(),
                        "parent": $scope.folderList[i].parentId == -1 ? "#" : $scope.folderList[i].parentId.toString(),
                        "text": folderName == ".private" ? translate("CONFIG.DASHBOARD.MY_DASHBOARD") : folderName,
                        "type": "parent"
                    });
                }
            }

            var list = $scope.boardList.map(function (ds) {
                return {
                    "id": ds.id,
                    "name": ds.name,
                    "parentId": ds.folderId,
                    "type": "child"
                };
            });

            originalData = jstree_CvtVPath2TreeData(list);

            originalData = _.union(originalData, $scope.folderData);

            jstree_ReloadTree(treeID, originalData);
        });
    };
    
    var getBoardList = function () {
        return $http.get("dashboard/getBoardList.do").success(function (response) {
            $scope.boardList = response;
            var tmp = $scope.boardList.map(function (item) {
                return item.folderId;
            });
            tmp.push($scope.privateFolder.id);
            $scope.folderIds = angular.toJson(tmp);


            $scope.getFolderList();

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
    var boardListPromise = getBoardList();
    getCategoryList();
    getDatasetList();

    $scope.newOperate = function () {
        $('div.newBoard').toggleClass('hideOperate');
        $scope.type = 'new';
    };

    $scope.newGridLayout = function () {
        $scope.showBox = true;
        $rootScope.freeLayout = false;
        $scope.curBoard = {layout: {rows: []}};
        $('div.newBoard').addClass('hideOperate');
    };

    $scope.newTimelineLayout = function () {
        $scope.showBox = true;
        $rootScope.freeLayout = false;
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
        $scope.showBox = true;
        var b = angular.copy(board);
        b.folderId = $scope.selectedFold.id;
        updateService.updateBoard(b);
        $scope.curBoard = b;
        $scope.type = 'edit';
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
            });
        });
    };

    $scope.showInfo = function () {
        if (!checkTreeNode("info")) return;
        var content = getSelectedBoard();
        ModalUtils.info(content, "modal-info", "lg");
    };

    $scope.widgetGroup = function (item) {
        // return item.categoryName;
    };

    $scope.addWidget = function (row) {
        var w = {};
        w.name = translate('CONFIG.DASHBOARD.CHART_NAME');
        w.width = 12;
        w.widgetId = $scope.widgetList[0].id;
        row.widgets.push(w);
    };

    $scope.addRow = function () {
        var row = {type: 'widget', widgets: []};
        $scope.curBoard.layout.rows.push(row);
        return row;
    };

    $scope.addNode = function (node) {
        $scope.curBoard.layout.rows.push({node: node, type: 'widget', widgets: []});
    };

    $scope.addPramRow = function () {
        $scope.curBoard.layout.rows.unshift({type: 'param', params: []});
    };

    $scope.addRelations = function(widget) {
        widget.relations = {};
        widget.relations.relations = [];
        $scope.changeSourceCol(widget, widget.widgetId);
    };

    $scope.delRelations = function(widget) {
        if(widget.relations){
          delete widget.relations;
        }
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
            if (!$scope.curBoard.id) {
                $scope.curBoard.id = serviceStatus.id;
            }

            if($scope.isPreview){
                $state.go('mine.view', {id: $scope.curBoard.id});
                $scope.isPreview = false;
                return;
            }
            ModalUtils.alert(serviceStatus.msg, "modal-success", "sm");
            getBoardList();
            boardChange();
        } else {
            ModalUtils.alert(serviceStatus.msg, "modal-warning", "sm");
        }
    }

    $scope.checkBeforPreview = function (Id) {
        $scope.isPreview = true;

        ModalUtils.confirm(translate("COMMON.CONFIRM_SAVE_BEFORE_PREVIEW"), "modal-warning", "lg", function () {
            $scope.saveWin($scope.type);
        });
    };

    $scope.saveWin = function (type) {
        var o = angular.copy($scope.curBoard);
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/saveWin.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: '40%',
            scope: $scope,
            controller: function ($scope, $uibModalInstance) {

                $scope.folderConfig = angular.copy(jsTreeConfig1);
                $scope.folderConfig.plugins = ['types', 'unique', 'sort'];

                $scope.folderConfig.core.data = $scope.folderData;

                $scope.o = o;
                $scope.type = type;
                $scope.ok = function () {
                    if (!o.name) {
                        $scope.alerts = [{msg: translate('CONFIG.WIDGET.WIDGET_NAME') + translate('COMMON.NOT_EMPTY'), type: 'danger'}];

                        $("#Name").focus();
                        return false;
                    }
                    if(!$scope.$parent.selectedFold.id){
                        $scope.alerts = [{msg: translate('CONFIG.COMMON.PLEASE_SELECT_FOLDER'), type: 'danger'}];
                        return false;
                    }

                    $scope.curBoard.name = o.name;
                    $scope.saveBoard(true, $scope.type);
                    $uibModalInstance.close();
                };
                
                $scope.cancel = function () {
                    $uibModalInstance.close();
                };
                $scope.selectedFolder = function () {
                    var selectedNodes = jstree_GetWholeTree("selectFolderID").get_selected(true);

                    if(selectedNodes.length > 0){
                        $scope.$parent.selectedFold = _.find($scope.folderList, function (f) {
                            return f.id == selectedNodes[0].id;
                        });
                    }
                };
            }
        }).rendered.then(function () {
            $timeout(function () {
                var instance = jstree_GetWholeTree("selectFolderID");
                instance.deselect_all();
                instance.open_all();
                instance.select_node($scope.selectedFold.id);
            }, 100);
        });
    };
    
    $scope.saveBoard = function (notify, type) {
        if (!validate()) {
            return;
        }
        clearDirty();
        $scope.curBoard.folderId = $scope.selectedFold.id;
        var callBack = saveBoardCallBack;
        if (notify == false) {
            callBack = function() {};
        }
        if (type == 'new' || $scope.curBoard.id == null) {
            return $http.post("dashboard/saveNewBoard.do", {json: angular.toJson($scope.curBoard)}).success(callBack);
        } else if (type == 'edit') {
            return $http.post(updateUrl, {json: angular.toJson($scope.curBoard)}).success(callBack);
        }
    };

    var clearDirty = function () {
        _.each($scope.curBoard.layout.rows, function(row){
            _.each(row.widgets, function(widget){
                delete widget.sourceId;
                if(!_.isUndefined(widget.relations)){
                    delete widget.relations.sourceFields;
                    _.each(widget.relations.relations, function(relation){
                        delete relation.targetFields;
                    });
                }
            });
        })
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
                    {name: translate('CONFIG.DASHBOARD.PARAM_TYPE_SELECTOR'), value: 'selector'},
                    {name: translate('CONFIG.DASHBOARD.PARAM_TYPE_SLIDER'), value: 'slider'}
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
                        ModalUtils.alert(translate('CONFIG.DASHBOARD.ENTER_PARAMETER_NAME'), "modal-warning", "lg");
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

    $("#" + treeID).keyup(function (e) {
        if (e.keyCode == 46) {
            $scope.deleteBoard(getSelectedBoard());
        }
    });
        
    $scope.selectedFolder = function () {
        var selectedNodes = jstree_GetWholeTree("selectFolderID").get_selected(true);
        if(selectedNodes.length > 0){

            $scope.selectedFold = _.find($scope.folderList, function (f) {
                return f.id == selectedNodes[0].id;
            });
        }
        $scope.openFolder = !$scope.openFolder;
    };
    
    var getSelectedBoard = function () {
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];

        $scope.selectedFold = _.find($scope.folderList, function (f) {
            return f.id == selectedNode.parent;
        });
        
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
        $scope.showBox = true;
        if (!checkTreeNode("edit")) return;
        $scope.editBoard(getSelectedBoard());
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];
        $state.go('config.board', {boardId: selectedNode.id}, {notify: false});
    };

    $scope.deleteNode = function () {
        if (!checkTreeNode("delete")) return;
        $scope.deleteBoard(getSelectedBoard());
    };

    $scope.treeEventsObj = function () {
        var baseEventObj = jstree_baseTreeEventsObj({
            ngScope: $scope, ngHttp: $http, ngTimeout: $timeout, ModalUtils: ModalUtils,
            treeID: treeID, listName: "boardList"
            , updateUrl: updateUrl
            , deleteUrl: deleteUrl
        });
        return baseEventObj;
    }();
    /**  js tree related start **/

    $scope.changeTargetCol = function (e, widgetId, index, row) {
        if (!e.relations) {
            return;
        }
        var w = _.find($scope.widgetList, function (w) {
            return w.id == widgetId;
        });
        if (!w) {
            return;
        }
        var dataSet = _.find($scope.datasetList, function (e) {
            return w.data.datasetId === e.id;
        });
        var cols = [];
        _.each(dataSet.data.schema.dimension, function (e) {
            if (e.type == "column") {
                if ($.inArray(e, cols) == -1) {
                    cols.push(e.column);
                }
            } else if (e.type == "level") {
                _.each(e.columns, function (e) {
                    if ($.inArray(e, cols) == -1) {
                        cols.push(e.column);
                    }
                });
            }
        });
        e.relations.relations[index].targetFields = cols;
        if (cols.length == 0) {
            dataService.getColumns({
                datasource: null,
                query: null,
                datasetId: w.data.datasetId,
                callback: function (dps) {
                    $scope.alerts = [];
                    if (dps.msg == "1") {
                        e.relations.relations[index].targetFields = dps.columns;
                    } else {
                        $scope.alerts = [{msg: dps.msg, type: 'danger'}];
                    }
                }
            });
        }

        //add target widget
        var flattenWgts = [];
        _.each($scope.curBoard.layout.rows, function (row) {
            flattenWgts = flattenWgts.concat(row.widgets);
        });
        if (_.where(flattenWgts, {"widgetId": widgetId}).length > 0 || _.isUndefined(row)) {
            return;
        }
        e.relations.relations[index].targetField = [];
        var w = {};
        w.name = _.find($scope.widgetList, function (e) {
            return e.id === widgetId
        }).name;
        w.width = 12;
        w.widgetId = widgetId;
        w.sourceId = e.widgetId;
        w.index = index;
        row.widgets = _.filter(row.widgets, function (e) {
            return e.sourceId !== w.sourceId || e.index !== index;
        });
        row.widgets.push(w);
    };

    $scope.changeSourceCol = function (e, widgetId) {
        if (!e.relations) {
            return;
        }
        //源表字段默认为原表的group key指定字段
        $http.get("dashboard/dashboardWidget.do?id=" + e.widgetId).then(function (response) {
            if (!response) {
                return false;
            }
            var config = response.data.data.config;
            var fields = [];
            _.each(config.groups, function (e) {
                fields.push(e.col);
            });
            _.each(config.keys, function (e) {
                fields.push(e.col);
            });
            if(!e.relations.sourceField || e.relations.sourceField.length<=0){
                e.relations.sourceField = fields;
            }
            e.relations.sourceFields = fields;
        });
    };

    $scope.changeTargetParam = function (e, boardId, index) {
        if (!e.relations) {
            return;
        }
        var w = _.find($scope.boardList, function (w) {
            return w.id == boardId;
        });
        if (!w) {
            return;
        }
        var cols = [];
        _.each(w.layout.rows, function (row) {
            if (row.type == "param") {
                _.each(row.params, function(param){
                    _.each(param.col, function(col){
                        if($.inArray(param.name, cols) == -1){
                            cols.push(param.name); //col.column+"("+col.datasetId+")"
                        }
                    });
                });
            }
        });
        //e.relations.relations[index].targetField = [];
        e.relations.relations[index].targetFields = cols;

    };

    $scope.addWidgetRelation = function(widget){
        widget.relations.relations.push({"type":"widget"});
        $('div.newRelation').addClass('hideOperate');
    };

    $scope.addBoardRelation = function(widget){
        widget.relations.relations.push({"type":"board"});
        $('div.newRelation').addClass('hideOperate');
    };

    $scope.changeActive = function(rowIndex, widgetIndex, index){
        var prefixId = rowIndex+"_"+widgetIndex+"_";
        var list = $('li[id^='+prefixId+'].active');
        if(list.length > 0 && list[0].id.split("_")[2] != index){
            return;
        }
        if(index-1<0){
            index = 0;
        }else{
            index = index-1;
        }
        $("#"+prefixId+index+"_"+"tab").addClass('active');
        $("#"+prefixId+index+"_"+"content").addClass('active');
    };

    var paramBoardId = $stateParams.boardId;
    if (paramBoardId) {
        boardListPromise.then(function () {
            var board = _.find($scope.boardList, function (ds) {
                return ds.id == paramBoardId;
            });
            if (board) {
                $scope.editBoard(board)
            }
        });
    }
});
