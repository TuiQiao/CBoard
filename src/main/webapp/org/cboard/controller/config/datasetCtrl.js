/**
 * Created by yfyuan on 2016/10/11.
 */
cBoard.controller('datasetCtrl', function ($scope, $http, $state, $stateParams, dataService, $uibModal, ModalUtils, $filter, chartService, $timeout, uuid4) {

    var translate = $filter('translate');
    $scope.optFlag = 'none';
    $scope.curDataset = {
        data: {
            expressions: [],
            filters: [],
            schema: {
                dimension: [],
                measure: []
            }
        }
    };
    $scope.curWidget = {};
    $scope.alerts = [];
    $scope.verify = {
        dsName: true
    };
    $scope.queryAceOpt = cbAcebaseOption;
    $scope.hierarchy = translate("CONFIG.DATASET.HIERARCHY");
    $scope.uuid4 = uuid4;
    $scope.params = [];

    var treeID = 'dataSetTreeID'; // Set to a same value with treeDom
    var originalData = [];
    var updateUrl = "dashboard/updateDataset.do";

    var trash = {};

    $scope.toTrash = function (array, index) {
        var o = array[index];
        if (o.type == 'column') {
            if (!trash[o.column]) {
                trash[o.column] = [];
            }
            trash[o.column].push(o);
        }
        array.splice(index, 1);
    };

    $scope.dndTransfer = {
        dimension: function (list, index, item, type) {
            if (type == 'column') {
                list[index] = {
                    type: 'column',
                    column: item
                };
            }
        },
        measure: function (list, index, item, type) {
            if (type == 'column') {
                list[index] = {
                    type: 'column',
                    column: item
                };
            }
        }
    };

    $http.get("dashboard/getDatasourceList.do").success(function (response) {
        $scope.datasourceList = response;
    });

    var getDatasetList = function () {
        $http.get("dashboard/getDatasetList.do").success(function (response) {
            $scope.datasetList = response;
            $scope.searchNode();
            if ($stateParams.id) {
                $scope.editDs(_.find($scope.datasetList, function (ds) {
                    return ds.id == $stateParams.id;
                }));
            }
        });
    };

    var getCategoryList = function () {
        $http.get("dashboard/getDatasetCategoryList.do").success(function (response) {
            $scope.categoryList = response;
            $("#DatasetName").autocomplete({
                source: $scope.categoryList
            });
        });
    };

    getCategoryList();
    getDatasetList();

    $scope.newDs = function () {
        $scope.optFlag = 'new';
        $scope.curDataset = {
            data: {
                expressions: [],
                filters: [],
                schema: {
                    dimension: [],
                    measure: []
                }
            }
        };
        $scope.curWidget = {};
        $scope.selects = [];
        cleanPreview();
    };

    $scope.editDs = function (ds) {
        $http.post("dashboard/checkDatasource.do", {
            id: ds.data.datasource
        }).success(function (response) {
            if (response.status == '1') {
                doEditDs(ds);
                $scope.doConfigParams();
            } else {
                ModalUtils.alert(translate("ADMIN.CONTACT_ADMIN") + "：Datasource/" + response.msg, "modal-danger", "lg");
            }
        });
    };

    var doEditDs = function (ds) {
        $scope.optFlag = 'edit';
        $scope.curDataset = angular.copy(ds);
        $scope.curDataset.name = $scope.curDataset.categoryName + '/' + $scope.curDataset.name;
        if (!$scope.curDataset.data.expressions) {
            $scope.curDataset.data.expressions = [];
        }
        if (!$scope.curDataset.data.filters) {
            $scope.curDataset.data.filters = [];
        }
        if (!$scope.curDataset.data.schema) {
            $scope.curDataset.data.schema = {
                dimension: [],
                measure: []
            };
        }
        $scope.datasource = _.find($scope.datasourceList, function (ds) {
            return ds.id == $scope.curDataset.data.datasource;
        });
        $scope.curWidget.query = $scope.curDataset.data.query;
        $scope.selects = ds.data.selects;
        //$scope.loadData();
    };

    $scope.checkExist = function (column) {
        var find = _.find($scope.curDataset.data.schema.measure, function (e) {
            return e.column == column;
        });
        if (!_.isUndefined(find)) {
            return true;
        }
        find = _.find($scope.curDataset.data.schema.dimension, function (e) {
            if (e.type == 'level') {
                var _find = _.find(e.columns, function (_e) {
                    return _e.column == column;
                });
                return !_.isUndefined(_find);
            } else {
                return e.column == column;
            }
        });
        return !_.isUndefined(find);
    };

    $scope.deleteDs = function (ds) {
        $http.get("dashboard/getAllWidgetList.do").then(function (response) {
            if (!response) {
                return false;
            }
            var resDs = [];

            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].data.datasetId == ds.id) {
                    resDs.push(response.data[i].name);
                }
            }

            if (resDs.length > 0) {
                var warnStr = translate("CONFIG.WIDGET.WIDGET") + ":[" + resDs.toString() + "]";
                ModalUtils.alert(translate("COMMON.NOT_ALLOWED_TO_DELETE_BECAUSE_BE_DEPENDENT") + warnStr, "modal-warning", "lg");
                return false;
            }
            ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg", function () {
                $http.post("dashboard/deleteDataset.do", {
                    id: ds.id
                }).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getDatasetList();
                    } else {
                        ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                    }
                    $scope.optFlag = 'none';
                });
            });
        });
    };

    $scope.copyDs = function (ds) {
        var data = angular.copy(ds);
        data.name = data.name + "_copy";
        $http.post("dashboard/saveNewDataset.do", {
            json: angular.toJson(data)
        }).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                $scope.optFlag = 'none';
                getDatasetList();
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
        });
    };

    var validate = function () {
        $scope.alerts = [];
        if (!$scope.curDataset.name) {
            $scope.alerts = [{
                msg: translate('CONFIG.DATASET.NAME') + translate('COMMON.NOT_EMPTY'),
                type: 'danger'
            }];
            $scope.verify = {
                dsName: false
            };
            $("#DatasetName").focus();
            return false;
        }
        for (i in $scope.params) {
            var name = $scope.params[i].name;
            var label = $scope.params[i].label;
            var required = $scope.params[i].required;
            var value = $scope.curWidget.query[name];
            if (required == true && value != 0 && (value == undefined || value == "")) {
                var pattern = /([\w_\s\.]+)/;
                var msg = pattern.exec(label);
                if (msg && msg.length > 0)
                    msg = translate(msg[0]);
                else
                    msg = label;
                $scope.alerts = [{
                    msg: "[" + msg + "]" + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                $scope.verify[name] = false;
                return false;
            }
        }
        return true;
    };

    $scope.save = function () {
        $scope.datasource ? $scope.curDataset.data.datasource = $scope.datasource.id : null;
        $scope.curDataset.data.query = $scope.curWidget.query;

        if (!validate()) {
            return;
        }
        var ds = angular.copy($scope.curDataset);
        var index = ds.name.lastIndexOf('/');
        ds.categoryName = $scope.curDataset.name.substring(0, index).trim();
        ds.name = $scope.curDataset.name.slice(index + 1).trim();
        if (ds.categoryName == '') {
            ds.categoryName = translate("COMMON.DEFAULT_CATEGORY");
        }

        if ($scope.optFlag == 'new') {
            $http.post("dashboard/saveNewDataset.do", {
                json: angular.toJson(ds)
            }).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getCategoryList();
                    getDatasetList();
                    $scope.verify = {
                        dsName: true
                    };
                    $scope.optFlag = 'edit'
                    $scope.curDataset.id = serviceStatus.id
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{
                        msg: serviceStatus.msg,
                        type: 'danger'
                    }];
                }
            });
        } else {
            $http.post(updateUrl, {
                json: angular.toJson(ds)
            }).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'edit';
                    getCategoryList();
                    getDatasetList();
                    $scope.verify = {
                        dsName: true
                    };
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{
                        msg: serviceStatus.msg,
                        type: 'danger'
                    }];
                }
            });
        }

    };

    $scope.editFilterGroup = function (col) {
        var columnObjs = schemaToSelect($scope.curDataset.data.schema);
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/filterGroup.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            scope: $scope,
            controller: function ($scope, $uibModalInstance) {
                if (col) {
                    $scope.data = angular.copy(col);
                } else {
                    $scope.data = {
                        group: '',
                        filters: [],
                        id: uuid4.generate()
                    };
                }
                $scope.columnObjs = columnObjs;
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.addColumn = function (str) {
                    $scope.data.filters.push({
                        col: str,
                        type: '=',
                        values: []
                    })
                };
                $scope.ok = function () {
                    if (col) {
                        col.group = $scope.data.group;
                        col.filters = $scope.data.filters;
                    } else {
                        if ($scope.$parent.curDataset.data.filters == null) {
                            $scope.$parent.curDataset.data.filters = [];
                        }
                        $scope.$parent.curDataset.data.filters.push($scope.data);
                    }
                    $uibModalInstance.close();
                };
                $scope.editFilter = function (filter) {
                    $uibModal.open({
                        templateUrl: 'org/cboard/view/dashboard/modal/param.html',
                        windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                        backdrop: false,
                        size: 'lg',
                        resolve: {
                            param: function () {
                                return angular.copy(filter);
                            },
                            filter: function () {
                                return false;
                            },
                            getSelects: function () {
                                return function (byFilter, column, callback) {
                                    dataService.getDimensionValues($scope.datasource.id, $scope.curWidget.query, undefined, column, undefined, function (filtered) {
                                        callback(filtered);
                                    });
                                };
                            },
                            ok: function () {
                                return function (param) {
                                    filter.type = param.type;
                                    filter.values = param.values;
                                }
                            }
                        },
                        controller: 'paramSelector'
                    });
                };
            }
        });
    };

    $scope.deleteFilterGroup = function (index) {
        ModalUtils.confirm(translate("COMMON.FILTER_GROUP") + ": [" + $scope.curDataset.data.filters[index].group + "], " +
            translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg",
            function () {
                $scope.curDataset.data.filters.splice(index, 1)
            }
        );
    };

    var schemaToSelect = function (schema, rawSelects) {
        if (schema.selects) {
            return angular.copy(schema.selects);
        } else {
            var selects = [];
            selects = selects.concat(schema.measure);
            _.each(schema.dimension, function (e) {
                if (e.type == 'level') {
                    _.each(e.columns, function (c) {
                        selects.push(c);
                    });
                } else {
                    selects.push(e);
                }
            });
            _.each(rawSelects, function (col) {
                if (_.find(selects, function (o) {
                        return col == o.column;
                    }) === undefined) {
                    selects.push({
                        column: col
                    });
                }
            });
            return angular.copy(selects);
        }
    };

    $scope.editExp = function (col) {
        var aggregate = [{
                name: 'sum',
                value: 'sum'
            },
            {
                name: 'count',
                value: 'count'
            },
            {
                name: 'avg',
                value: 'avg'
            },
            {
                name: 'max',
                value: 'max'
            },
            {
                name: 'min',
                value: 'min'
            },
            {
                name: 'distinct',
                value: 'distinct'
            }
        ];
        var ok;
        var data = {
            expression: ''
        };
        if (!col) {
            ok = function (exp, alias) {
                $scope.curDataset.data.expressions.push({
                    type: 'exp',
                    exp: data.expression,
                    alias: data.alias,
                    id: uuid4.generate()
                });
            }
        } else {
            data.expression = col.exp;
            data.alias = col.alias;
            ok = function (data) {
                col.exp = data.expression;
                col.alias = data.alias;
            }
        }
        var columnObjs = schemaToSelect($scope.curDataset.data.schema, $scope.selects);
        var expressions = $scope.curDataset.data.expressions;
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/exp.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            scope: $scope,
            controller: function ($scope, $uibModalInstance) {
                $scope.data = data;
                $scope.columnObjs = columnObjs;
                $scope.aggregate = aggregate;
                $scope.expressions = expressions;
                $scope.alerts = [];
                $scope.expAceOpt = expEditorOptions($scope.selects, aggregate, function (_editor) {
                    $scope.expAceEditor = _editor;
                    $scope.expAceSession = _editor.getSession();
                    _editor.focus();
                });
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.addToken = function (str, agg) {
                    var editor = $scope.expAceEditor;
                    editor.session.insert(editor.getCursorPosition(), str);
                    editor.focus();
                    if (agg) editor.getSelection().moveCursorLeft();
                };
                $scope.verify = function () {
                    $scope.alerts = [];
                    var v = verifyAggExpRegx($scope.data.expression);
                    $scope.alerts = [{
                        msg: v.isValid ? translate("COMMON.SUCCESS") : v.msg,
                        type: v.isValid ? 'success' : 'danger'
                    }];
                };
                $scope.ok = function () {
                    if (!$scope.data.alias) {
                        ModalUtils.alert(translate('CONFIG.WIDGET.ALIAS') + translate('COMMON.NOT_EMPTY'), "modal-warning", "lg");
                        return;
                    }
                    $scope.data.expression = $scope.expAceSession.getValue();
                    ok($scope.data);
                    $uibModalInstance.close();
                };
            }
        });
    };

    $scope.deleteExp = function (index) {
        ModalUtils.confirm(translate("CONFIG.COMMON.CUSTOM_EXPRESSION") + ": [" + $scope.curDataset.data.expressions[index].alias + "], " +
            translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg",
            function () {
                $scope.curDataset.data.expressions.splice(index, 1)
            }
        );
    };

    $scope.createNode = function (item) {
        if (trash[item.column]) {
            var _i = trash[item.column].pop();
            if (_i) {
                return _i;
            }
        }
        item.id = uuid4.generate();
        return item;
    };

    $scope.measureToDimension = function (index, o) {
        $scope.curDataset.data.schema.measure.splice(index, 1);
        $scope.curDataset.data.schema.dimension.push(o);
    };

    $scope.toDimension = function (o) {
        $scope.curDataset.data.schema.dimension.push($scope.createNode(o));
    };

    $scope.custom = function (o) {
        var selects = $scope.selects;
        var datasource = $scope.datasource;
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/custom.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            controller: function ($scope, $uibModalInstance) {
                $scope.c = o;
                $scope.ok = function () {
                    $uibModalInstance.close();
                };
                $scope.customAceOpt = schemaCustomOpt(selects, datasource.type);
            }
        });
    };

    $scope.loadData = function (reload) {

        if (reload != true) {
            reload = false;
        }

        cleanPreview();
        $scope.loading = true;

        dataService.getColumns({
            datasource: $scope.datasource.id,
            query: $scope.curWidget.query,
            datasetId: null,
            reload: reload,
            callback: function (dps) {
                $scope.loading = false;
                $scope.toChartDisabled = false;
                if (dps.msg == "1") {
                    $scope.alerts = [];
                    $scope.selects = dps.columns;
                } else {
                    $scope.alerts = [{
                        msg: dps.msg,
                        type: 'danger'
                    }];
                }

                var widget = {
                    chart_type: "table",
                    filters: [],
                    groups: [],
                    keys: [],
                    selects: [],
                    values: [{
                        cols: []
                    }]
                };
                _.each($scope.selects, function (c) {
                    widget.keys.push({
                        col: c,
                        type: "eq",
                        values: []
                    });
                });
                $scope.curDataset.data.selects = $scope.selects;
            }
        });
    };

    var cleanPreview = function () {
        $('#dataset_preview').html("");
    };

    /**  js tree related start **/
    $scope.treeConfig = jsTreeConfig1;

    $("#" + treeID).keyup(function (e) {
        if (e.keyCode == 46) {
            $scope.deleteNode();
        }
    });

    var getSelectedDataSet = function () {
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];
        return _.find($scope.datasetList, function (ds) {
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
        $scope.copyDs(getSelectedDataSet());
    };

    $scope.editNode = function () {
        if (!checkTreeNode("edit")) return;
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];
        $state.go('config.dataset', {
            id: selectedNode.id
        }, {
            notify: false
        });
        $scope.editDs(getSelectedDataSet());
    };

    $scope.deleteNode = function () {
        if (!checkTreeNode("delete")) return;
        $scope.deleteDs(getSelectedDataSet());
    };
    $scope.showInfo = function () {
        if (!checkTreeNode("info")) return;
        var content = getSelectedDataSet();
        ModalUtils.info(content, "modal-info", "lg");
    };
    $scope.searchNode = function () {
        var para = {
            dsName: '',
            dsrName: ''
        };
        //map datasetList to list (add datasourceName)
        var list = $scope.datasetList.map(function (ds) {
            var dsr = _.find($scope.datasourceList, function (obj) {
                return obj.id == ds.data.datasource
            });
            return {
                "id": ds.id,
                "name": ds.name,
                "categoryName": ds.categoryName,
                "datasourceName": dsr ? dsr.name : ''
            };
        });
        //split search keywords
        if ($scope.keywords) {
            if ($scope.keywords.indexOf(' ') == -1 && $scope.keywords.indexOf(':') == -1) {
                para.dsName = $scope.keywords;
            } else {
                var keys = $scope.keywords.split(' ');
                for (var i = 0; i < keys.length; i++) {
                    var w = keys[i].trim();
                    if (w.split(':')[0] == 'ds') {
                        para["dsName"] = w.split(':')[1];
                    }
                    if (w.split(':')[0] == 'dsr') {
                        para["dsrName"] = w.split(':')[1];
                    }
                }
            }
        }
        //filter data by keywords
        originalData = jstree_CvtVPath2TreeData(
            $filter('filter')(list, {
                name: para.dsName,
                datasourceName: para.dsrName
            })
        );

        jstree_ReloadTree(treeID, originalData);
    };

    $scope.treeEventsObj = function () {
        var baseEventObj = jstree_baseTreeEventsObj({
            ngScope: $scope,
            ngHttp: $http,
            ngTimeout: $timeout,
            ModalUtils: ModalUtils,
            treeID: treeID,
            listName: "datasetList",
            updateUrl: updateUrl
        });
        return baseEventObj;
    }();

    $scope.doConfigParams = function () {
        $http.get('dashboard/getConfigParams.do', {
            params: {
                type: $scope.datasource.type,
                datasourceId: $scope.datasource.id,
                page: 'dataset.html'
            }
        }).then(function (response) {
            $scope.params = response.data;
        });
    };

    $scope.changeDs = function () {
        $scope.curWidget.query = {};
        $http.get('dashboard/getConfigParams.do', {
            params: {
                type: $scope.datasource.type,
                datasourceId: $scope.datasource.id,
                page: 'dataset.html'
            }
        }).then(function (response) {
            $scope.params = response.data;
            for (i in $scope.params) {
                var name = $scope.params[i].name;
                var value = $scope.params[i].value;
                var checked = $scope.params[i].checked;
                var type = $scope.params[i].type;
                if (type == "checkbox" && checked == true) {
                    $scope.curWidget.query[name] = true;
                }
                if (type == "number" && value != "" && !isNaN(value)) {
                    $scope.curWidget.query[name] = Number(value);
                } else if (value != "") {
                    $scope.curWidget.query[name] = value;
                }
            }
        });
    };

    /**  js tree related end **/


    /** Ace Editor Starer... **/
    $scope.queryAceOpt = datasetEditorOptions();

});