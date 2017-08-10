/**
 * Created by yfyuan on 2016/8/12.
 */
'use strict';
cBoard.controller('widgetCtrl', function ($scope, $stateParams, $http, $uibModal, dataService, ModalUtils, updateService, $filter, chartService, $timeout) {

        var translate = $filter('translate');
        var updateUrl = "dashboard/updateWidget.do";
        //图表类型初始化
        $scope.chart_types = [
            {
                name: translate('CONFIG.WIDGET.TABLE'), value: 'table', class: 'cTable',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.LINE_BAR'), value: 'line', class: 'cLine',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.SCATTER'), value: 'scatter', class: 'cScatter',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.PIE'), value: 'pie', class: 'cPie',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.KPI'), value: 'kpi', class: 'cKpi',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.FUNNEL'), value: 'funnel', class: 'cFunnel',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.SANKEY'), value: 'sankey', class: 'cSankey',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.RADAR'), value: 'radar', class: 'cRadar',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.MAP'), value: 'map', class: 'cMap',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.GAUGE'), value: 'gauge', class: 'cGauge',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.WORD_CLOUD'), value: 'wordCloud', class: 'cWordCloud',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.TREE_MAP'), value: 'treeMap', class: 'cTreeMap',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.AREA_MAP'), value: 'areaMap', class: 'cAreaMap',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.HEAT_MAP_CALENDER'), value: 'heatMapCalendar', class: 'cHeatMapCalendar',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.HEAT_MAP_TABLE'), value: 'heatMapTable', class: 'cHeatMapTable',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.MARK_LINE_MAP'), value: 'markLineMap', class: 'cMarkLineMap',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.LIQUID_FILL'), value: 'liquidFill', class: 'cLiquidFill',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            }
        ];

        $scope.chart_types_status = {
            "line": true, "pie": true, "kpi": true, "table": true,
            "funnel": true, "sankey": true, "radar": true, "map": true,
            "scatter": true, "gauge": true, "wordCloud": true, "treeMap": true,
            "areaMap": true, "heatMapCalendar": true, "heatMapTable": true,
            "markLineMap": true, "liquidFill": true
        };

        $scope.value_series_types = [
            {name: translate('CONFIG.WIDGET.LINE'), value: 'line'},
            {name: translate('CONFIG.WIDGET.BAR'), value: 'bar'},
            {name: translate('CONFIG.WIDGET.STACKED_BAR'), value: 'stackbar'},
            {name: translate('CONFIG.WIDGET.PERCENT_BAR'), value: 'percentbar'}
        ];

        $scope.value_aggregate_types = [
            {name: 'sum', value: 'sum'},
            {name: 'count', value: 'count'},
            {name: 'avg', value: 'avg'},
            {name: 'max', value: 'max'},
            {name: 'min', value: 'min'},
            {name: 'distinct', value: 'distinct'}
        ];

        $scope.kpi_styles = [
            {name: translate('CONFIG.WIDGET.AQUA'), value: 'bg-aqua'},
            {name: translate('CONFIG.WIDGET.RED'), value: 'bg-red'},
            {name: translate('CONFIG.WIDGET.GREEN'), value: 'bg-green'},
            {name: translate('CONFIG.WIDGET.YELLOW'), value: 'bg-yellow'}
        ];

        $.getJSON('plugins/FineMap/mapdata/citycode.json', function (data) {
            $scope.provinces = data.provinces;
        });

        $scope.treemap_styles = [
            {name: translate('CONFIG.WIDGET.RANDOM'), value: 'random'},
            {name: translate('CONFIG.WIDGET.MULTI'), value: 'multi'},
            {name: translate('CONFIG.WIDGET.BLUE'), value: 'blue'},
            {name: translate('CONFIG.WIDGET.RED'), value: 'red'},
            {name: translate('CONFIG.WIDGET.GREEN'), value: 'green'},
            {name: translate('CONFIG.WIDGET.YELLOW'), value: 'yellow'},
            {name: translate('CONFIG.WIDGET.PURPLE'), value: 'purple'}
        ];

        $scope.heatmap_styles = [
            {name: translate('CONFIG.WIDGET.BLUE'), value: 'blue'},
            {name: translate('CONFIG.WIDGET.RED'), value: 'red'},
            {name: translate('CONFIG.WIDGET.GREEN'), value: 'green'},
            {name: translate('CONFIG.WIDGET.YELLOW'), value: 'yellow'},
            {name: translate('CONFIG.WIDGET.PURPLE'), value: 'purple'}
        ];

        $scope.heatmap_date_format = [
            {name: 'yyyy-MM-dd', value: 'yyyy-MM-dd'},
            {name: 'yyyy/MM/dd', value: 'yyyy/MM/dd'},
            {name: 'yyyyMMdd', value: 'yyyyMMdd'}
        ];

        $scope.liquid_fill_style = [
            {name: translate('CONFIG.WIDGET.CIRCLE'), value: 'circle'},
            {name: translate('CONFIG.WIDGET.PIN'), value: 'pin'},
            {name: translate('CONFIG.WIDGET.RECT'), value: 'rect'},
            {name: translate('CONFIG.WIDGET.ARROW'), value: 'arrow'},
            {name: translate('CONFIG.WIDGET.TRIANGLE'), value: 'triangle'},
            {name: translate('CONFIG.WIDGET.ROUND_RECT'), value: 'roundRect'},
            {name: translate('CONFIG.WIDGET.SQUARE'), value: 'square'},
            {name: translate('CONFIG.WIDGET.DIAMOND'), value: 'diamond'}
        ];

        /***************************************
         *  0:  None items
         *  1:  only 1 item
         * -1:  None Restrict
         *  2:  1 or more
         ***************************************/
        $scope.configRule = {
            line: {keys: 2, groups: -1, filters: -1, values: 2},
            pie: {keys: 2, groups: -1, filters: -1, values: 2},
            kpi: {keys: 0, groups: 0, filters: -1, values: 1},
            table: {keys: -1, groups: -1, filters: -1, values: -1},
            funnel: {keys: -1, groups: 0, filters: -1, values: 2},
            sankey: {keys: 2, groups: 2, filters: -1, values: 1},
            radar: {keys: 2, groups: -1, filters: -1, values: 2},
            map: {keys: 2, groups: -1, filters: -1, values: 2},
            scatter: {keys: 2, groups: -1, filters: -1, values: 2},
            gauge: {keys: 0, groups: 0, filters: -1, values: 1},
            wordCloud: {keys: 2, groups: 0, filters: -1, values: 1},
            treeMap: {keys: 2, groups: 0, filters: -1, values: 1},
            areaMap: {keys: 2, groups: -1, filters: -1, values: 1},
            heatMapCalendar: {keys: 1, groups: 0, filters: -1, values: 1},
            heatMapTable: {keys: -1, groups: -1, filters: -1, values: 1},
            markLineMap: {keys: 2, groups: 2, filters: -1, values: 1},
            liquidFill: {keys: 0, groups: 0, filters: -1, values: 1}
        };

        //界面控制
        $scope.loading = false;
        $scope.toChartDisabled = true;
        $scope.optFlag = '';
        $scope.alerts = [];
        $scope.treeData = [];
        var originalData = [];
        var treeID = 'widgetTreeID'; // Set to a same value with treeDom

        $scope.datasource;
        $scope.widgetName;
        $scope.widgetCategory;
        $scope.widgetId;
        $scope.curWidget = {};
        $scope.previewDivWidth = 12;
        $scope.expressions = [];
        $scope.customDs = false;
        $scope.loadFromCache = true;
        $scope.filterSelect = {};
        $scope.verify = {widgetName: true};
        $scope.params = [];


        var loadDataset = function (callback) {
            $http.get("dashboard/getDatasetList.do").success(function (response) {
                $scope.datasetList = response;
                if (callback) {
                    callback();
                }
            });
        };
        loadDataset();
        // $http.get("dashboard/getDatasetCategoryList.do").success(function (response) {
        //     $scope.datasetCategoryList = response;
        // });

        $http.get("dashboard/getDatasourceList.do").success(function (response) {
            $scope.datasourceList = response;
            getCategoryList();
            getWidgetList(function () {
                if ($stateParams.id) {
                    $scope.editWgt(_.find($scope.widgetList, function (w) {
                        return w.id == $stateParams.id;
                    }));
                }
            });
        });

        $scope.datasetGroup = function (item) {
            return item.categoryName;
        };

        var getWidgetList = function (callback) {
            $http.get("dashboard/getWidgetList.do").success(function (response) {
                $scope.widgetList = response;
                if (callback) {
                    callback();
                }
                $scope.searchNode();
            });
        };

        var getCategoryList = function () {
            $http.get("dashboard/getWidgetCategoryList.do").success(function (response) {
                $scope.categoryList = response;
                $("#widgetName").autocomplete({
                    source: $scope.categoryList
                });
            });
        };

        $scope.editExp = function (col) {
            var selects = schemaToSelect($scope.schema);
            var aggregate = $scope.value_aggregate_types;
            var curWidget = $scope.curWidget;
            var ok;
            var data = {expression: ''};
            if (!col) {
                ok = function (data) {
                    $scope.curWidget.expressions.push({
                        type: 'exp',
                        exp: data.expression,
                        alias: data.alias
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

            $uibModal.open({
                templateUrl: 'org/cboard/view/config/modal/exp.html',
                windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                backdrop: false,
                size: 'lg',
                controller: function ($scope, $uibModalInstance) {
                    $scope.data = data;
                    $scope.curWidget = curWidget;
                    $scope.selects = selects;
                    $scope.aggregate = aggregate;
                    $scope.alerts = [];
                    $scope.close = function () {
                        $uibModalInstance.close();
                    };
                    $scope.expAceOpt = expEditorOptions(selects, aggregate);
                    $scope.addToken = function (str, agg) {
                        var tc = document.getElementById("expression_area");
                        var tclen = $scope.data.expression.length;
                        tc.focus();
                        var selectionIdx = 0;
                        if (typeof document.selection != "undefined") {
                            document.selection.createRange().text = str;
                            selectionIdx = str.length - 1;
                        }
                        else {
                            var a = $scope.data.expression.substr(0, tc.selectionStart);
                            var b = $scope.data.expression.substring(tc.selectionStart, tclen);
                            $scope.data.expression = a + str;
                            selectionIdx = $scope.data.expression.length - 1;
                            $scope.data.expression += b;
                        }
                        if (!agg) {
                            selectionIdx++;
                        }
                        tc.selectionStart = selectionIdx;
                        tc.selectionEnd = selectionIdx;
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
                        ok($scope.data);
                        $uibModalInstance.close();
                    };
                }
            });
        };

        $scope.loadData = function () {

            $scope.toChartDisabled = false;
            $scope.newConfig();
            $scope.filterSelect = {};
            loadDataset(function () {
                $scope.curWidget.expressions = [];
                loadDsExpressions();
                $scope.curWidget.filterGroups = [];
                loadDsFilterGroups();
                buildSchema();
            });
            cleanPreview();
        };

        $scope.newWgt = function () {
            $scope.curWidget = {};
            $scope.curWidget.config = {};
            $scope.curWidget.config.option = {};
            $scope.curWidget.expressions = [];
            $scope.curWidget.filterGroups = [];
            $scope.curWidget.query = {};
            $scope.datasource = null;
            $scope.widgetName = null;
            $scope.widgetCategory = null;
            $scope.widgetId = null;
            $scope.optFlag = 'new';
            $scope.customDs = false;
            $scope.schema = null;
            addValidateWatch();
        };

        var loadDsFilterGroups = function () {
            if (!$scope.customDs) {
                var fg = _.find($scope.datasetList, function (ds) {
                    return ds.id == $scope.curWidget.datasetId;
                }).data.filters;
                if (fg) {
                    _.each(fg, function (e) {
                        $scope.curWidget.filterGroups.push(e);
                    });
                }
            }
        };

        $scope.isDsExpression = function (o) {
            if ($scope.customDs) {
                return false;
            } else {
                var dsExp = _.find($scope.datasetList, function (ds) {
                    return ds.id == $scope.curWidget.datasetId;
                }).data.expressions;
                var exp = _.find(dsExp, function (e) {
                    return e.id && o.id == e.id;
                });
                return !_.isUndefined(exp);
            }
        };

        $scope.isDsFilter = function (o) {
            if ($scope.customDs) {
                return false;
            } else {
                var fg = _.find($scope.datasetList, function (ds) {
                    return ds.id == $scope.curWidget.datasetId;
                }).data.filters;
                var f = _.find(fg, function (e) {
                    return e.id && o.id == e.id;
                });
                return !_.isUndefined(f);
            }
        };

        var loadDsExpressions = function () {
            if (!$scope.customDs) {
                var dsExp = _.find($scope.datasetList, function (ds) {
                    return ds.id == $scope.curWidget.datasetId;
                }).data.expressions;
                if (dsExp) {
                    _.each(dsExp, function (e) {
                        $scope.curWidget.expressions.push(e);
                    });
                }
            }
        };

        var addWatch = function () {
            $scope.$watch('curWidget.config.keys', changeChartStatus, true);
            $scope.$watch('curWidget.config.groups', changeChartStatus, true);
            $scope.$watch('curWidget.config.values', changeChartStatus, true);
            $scope.$watch('curWidget.config.filters', changeChartStatus, true);
            addValidateWatch();
        };

        var addValidateWatch = function () {
            $scope.$watch('widgetName', clearAlert, true);
            $scope.$watch('curWidget.datasetId', clearAlert, true);
        };
        var clearAlert = function () {
            $scope.alerts = [];
            $scope.verify = {widgetName: true};
        };
        var validation = function () {
            $scope.alerts = [];
            $scope.verify = {widgetName: true};
            if (!$scope.widgetName) {
                $scope.alerts = [{
                    msg: translate('CONFIG.WIDGET.WIDGET_NAME') + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                $scope.verify = {widgetName: false};
                $("#widgetName").focus();
                return false;
            }
            if ($scope.customDs == false && $scope.curWidget.datasetId == undefined) {
                $scope.alerts = [{
                    msg: translate('CONFIG.WIDGET.DATASET') + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                return false;
            }
            if ($scope.customDs == true) {
                for (var i = 0; i < $scope.params.length; i++) {
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
                        $scope.alerts = [{msg: "[" + msg + "]" + translate('COMMON.NOT_EMPTY'), type: 'danger'}];
                        $scope.verify[name] = false;
                        return false;
                    }
                }
            }
            return true;
        };
        var changeChartStatus = function () {
            for (var type in $scope.chart_types_status) {
                var rule = $scope.configRule[type];
                var config = $scope.curWidget.config;
                var flattenValues = [];
                _.each(config.values, function(v) {
                    flattenValues = flattenValues.concat(v.cols);
                });
                if (_.size(config.keys) == 0 && _.size(config.groups) == 0 && _.size(flattenValues) == 0) {
                    r = false;
                } else {
                    for (var k in rule) {
                        var r = true;
                        if (rule[k] == 2) {
                            if (k == 'values') {
                                r = (_.size(flattenValues) >= 1);
                            } else {
                                r = (_.size(config[k]) >= 1);
                            }
                        } else if (rule[k] != -1) {
                            if (k == 'values') {
                                r = (_.size(flattenValues) == rule[k]);
                            } else {
                                r = (_.size(config[k]) == rule[k]);
                            }
                        }
                        if (!r) {
                            $scope.chart_types_status[type] = r;
                            break;
                        }
                    }
                }
                $scope.chart_types_status[type] = r;
            }
        };

        $scope.changeChart = function (chart_type) {
            if (!$scope.chart_types_status[chart_type]) {
                return;
            }
            var oldConfig = angular.copy($scope.curWidget.config);
            $scope.curWidget.config = {};
            $scope.curWidget.config.option = {};
            $scope.curWidget.config.chart_type = chart_type;
            //loadDsExpressions();
            cleanPreview();

            $scope.curWidget.config.selects = oldConfig.selects;
            $scope.curWidget.config.keys = oldConfig.keys;
            $scope.curWidget.config.groups = oldConfig.groups;
            $scope.curWidget.config.values = [];

            $scope.curWidget.config.filters = oldConfig.filters;
            switch ($scope.curWidget.config.chart_type) {
                case 'line':
                    _.each(oldConfig.values, function (v) {
                        $scope.curWidget.config.values.push({name: v.name, cols: v.cols});
                    });
                    $scope.curWidget.config.valueAxis = 'vertical';
                    _.each($scope.curWidget.config.values, function (v) {
                        v.series_type = 'line';
                        v.type = 'value';
                    });
                    break;
                case 'kpi':
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    _.each($scope.curWidget.config.values, function (v) {
                        v.style = 'bg-aqua';
                    });
                    break;
                case 'scatter':
                    var i = 0;
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            if (i >= 3) {
                                $scope.curWidget.config.selects.push(c.col);
                                return;
                            }
                            if (!$scope.curWidget.config.values[i]) {
                                $scope.curWidget.config.values[i] = {name: '', cols: []};
                            }
                            $scope.curWidget.config.values[i].cols.push(c);
                            i++
                        });
                    });
                    for (var i = 0; i < 3; i++) {
                        if (!$scope.curWidget.config.values[i]) {
                            $scope.curWidget.config.values[i] = {name: '', cols: []};
                        }
                    }
                    break;
                case 'gauge':
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.styles = [
                        {proportion: '0.2', color: '#228b22'},
                        {proportion: '0.8', color: '#48b'},
                        {proportion: '1', color: '#ff4500'}
                    ];
                    break;
                case 'areaMap':
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    _.each($scope.curWidget.config.values, function (v) {
                        v.style = 'bg-aqua';
                    });
                    break;
                case 'heatMapCalendar':
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    _.each($scope.curWidget.config.values, function (v) {
                        v.dateFormat = 'yyyy-MM-dd';
                        v.style = 'blue';
                    });
                    break;
                case 'heatMapTable':
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    _.each($scope.curWidget.config.values, function (v) {
                        v.style = 'blue';
                    });
                    break;
                case 'liquidFill':
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.animation = 'static';
                    _.each($scope.curWidget.config.values, function (v) {
                        v.style = 'circle';
                    });
                    break;
                case 'markLineMap':
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    _.each($scope.curWidget.config.values, function (v) {
                        v.style = 'bg-aqua';
                    });
                    break;
                default:
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    break;
            }
            _.each($scope.curWidget.config.values, function (v) {
                _.each(v.cols, function (c) {
                    delete c.formatter;
                });
            });
            $scope.preview();
        };

        $scope.newConfig = function () {
            $scope.curWidget.config = {};
            $scope.curWidget.config.option = {};
            $scope.curWidget.config.chart_type = 'table';
            cleanPreview();
            switch ($scope.curWidget.config.chart_type) {
                case 'line':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = new Array();
                    $scope.curWidget.config.filters = new Array();
                    $scope.curWidget.config.valueAxis = 'vertical';
                    $scope.add_value();
                    break;
                case 'pie':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'kpi':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: [],
                        style: 'bg-aqua'
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'table':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'funnel':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'sankey':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'radar':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'map':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'gauge':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    $scope.curWidget.config.styles = [
                        {proportion: '0.2', color: '#228b22'},
                        {proportion: '0.8', color: '#48b'},
                        {proportion: '1', color: '#ff4500'}
                    ];
                    break;
                case 'areaMap':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'heatMapCalendar':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: [],
                        dateFormat: 'yyyy-MM-dd',
                        style: 'blue'
                    }];
                    break;
                case 'heatMapTable':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: [],
                        style: 'blue'
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'markLineMap':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'liquidFill':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: [],
                        style: 'circle'
                    }];
                    $scope.curWidget.config.filters = new Array();
                    $scope.curWidget.config.animation = 'static';
                    break;
            }
            addWatch();
        };

        var cleanPreview = function () {
            $('#preview_widget').html("");
            $('#viewQuery_widget').html("");
            $scope.viewQueryMoal = false;
        };

        $scope.previewQuery = function () {
            $('#viewQuery_widget').html("");
            $timeout(function(){
                angular.element('#viewQuery_widget_tab').trigger('click');
            });
            $scope.loadingPre = true;
            dataService.viewQuery({
                config: $scope.curWidget.config,
                datasource: $scope.datasource ? $scope.datasource.id : null,
                query: $scope.curWidget.query,
                datasetId: $scope.customDs ? undefined : $scope.curWidget.datasetId
            }, function (query) {
                var querybr = query.trim().replace(/\n/g, '<br/>').replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                $('#viewQuery_widget').html("<div class='alert alert-info' role='alert' style='text-align: left;'><p style='color: black'>" + querybr + "</p></div>");
                $scope.loadingPre = false;
                $scope.viewQueryMoal = true;
            });
        };

        $scope.preview = function () {
            $('#preview_widget').html("");
            $timeout(function(){
                angular.element('#preview_widget_tab').trigger('click');
            });
            $scope.loadingPre = true;
            // --- start ---
            // 添加echarts3.6.2后这里除了第一次可以加载echarts图表，再次加载无法显示图表。
            // 完全无法找到问题下，出于无奈嵌套了一层后发现可以显示图表。囧！！
            // 具体原因没有找到，求大神帮忙解决，thanks！
            $('#preview_widget').html("<div id='preview' style='min-height: 300px; user-select: text;'></div>");
            // --- end ---
            chartService.render($('#preview'), {
                config: $scope.curWidget.config,
                datasource: $scope.datasource ? $scope.datasource.id : null,
                query: $scope.curWidget.query,
                datasetId: $scope.customDs ? undefined : $scope.curWidget.datasetId
            }, function (option) {
                switch ($scope.curWidget.config.chart_type) {
                    case 'line':
                        $scope.previewDivWidth = 12;
                        option.toolbox = {
                            feature: {
                                dataView: {
                                    show: true,
                                    readOnly: true
                                }
                            }
                        };
                        break;
                    case 'pie':
                        $scope.previewDivWidth = 12;
                        option.toolbox = {
                            feature: {
                                dataView: {
                                    show: true,
                                    readOnly: true
                                }
                            }
                        };
                        break;
                    case 'kpi':
                        $scope.previewDivWidth = 6;
                        break;
                    case 'table':
                        $scope.previewDivWidth = 12;
                        break;
                    case 'funnel':
                        $scope.previewDivWidth = 12;
                        option.toolbox = {
                            feature: {
                                dataView: {
                                    show: true,
                                    readOnly: true
                                }
                            }
                        };
                        break;
                    case 'sankey':
                        $scope.previewDivWidth = 12;
                        option.toolbox = {
                            feature: {
                                dataView: {
                                    show: true,
                                    readOnly: true
                                }
                            }
                        };
                        break;
                    case 'map':
                        $scope.previewDivWidth = 12;
                        break;
                    case 'areaMap':
                        $scope.previewDivWidth = 12;
                        break;
                    case 'markLineMap':
                        $scope.previewDivWidth = 12;
                        break;
                }
                $scope.loadingPre = false;
            }, null, !$scope.loadFromCache);
        };

// $scope.saveChart = function () {
//     dashboardService.saveWidget('123', $scope.datasource, $scope.config);
// };

        $scope.add_value = function () {
            $scope.curWidget.config.values.push({
                name: '',
                series_type: 'line',
                type: 'value',
                cols: []
            });
        };

        $scope.add_style = function () {
            $scope.curWidget.config.styles.push({
                proportion: '',
                color: ''
            });
        };

        var saveWgtCallBack = function (serviceStatus) {
            if (serviceStatus.status == '1') {
                getWidgetList();
                getCategoryList();
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
        };

        $scope.saveWgt = function () {
            if (!validation()) {
                return;
            }

            var o = {};
            o.name = $scope.widgetName.slice($scope.widgetName.lastIndexOf("/") + 1).trim();
            o.categoryName = $scope.widgetName.substring(0, $scope.widgetName.lastIndexOf("/")).trim();
            if (o.categoryName == '') {
                o.categoryName = translate("COMMON.DEFAULT_CATEGORY");
            }
            o.data = {};
            o.data.config = $scope.curWidget.config;
            if ($scope.customDs) {
                o.data.query = $scope.curWidget.query;
                o.data.datasource = $scope.datasource.id;
            } else {
                o.data.datasetId = $scope.curWidget.datasetId;
            }
            o.data.expressions = _.filter($scope.curWidget.expressions, function (e) {
                return !$scope.isDsExpression(e);
            });
            o.data.filterGroups = _.filter($scope.curWidget.filterGroups, function (e) {
                return !$scope.isDsFilter(e);
            });
            $scope.alerts = [];
            $scope.verify = {widgetName: true};

            if (o.name == null || o.name == "") {
                $scope.alerts = [{
                    msg: translate('CONFIG.WIDGET.WIDGET_NAME') + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                $scope.verify = {widgetName: false};
                $("#widgetName").focus();
                return;
            } else if (o.data.datasetId == undefined && $scope.customDs == false) {
                $scope.alerts = [{
                    msg: translate('CONFIG.WIDGET.DATASET') + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                return;
            }

            if ($scope.optFlag == 'new') {
                $http.post("dashboard/saveNewWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getWidgetList();
                        getCategoryList();
                        ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                    } else {
                        $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                    }
                });
            } else if ($scope.optFlag == 'edit') {
                o.id = $scope.widgetId;
                $http.post(updateUrl, {json: angular.toJson(o)}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getWidgetList();
                        getCategoryList();
                        ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                    } else {
                        $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                    }
                });
            }
        };

        $scope.editWgt = function (widget) {
            $http.post("dashboard/checkWidget.do", {id: widget.id}).success(function (response) {
                if (response.status == '1') {
                    doEditWgt(widget);
                    if($scope.customDs == true) $scope.doConfigParams();
                } else {
                    var d = widget.data.datasetId ? 'CONFIG.WIDGET.DATASET' : 'CONFIG.WIDGET.DATA_SOURCE';
                    ModalUtils.alert(translate("ADMIN.CONTACT_ADMIN") + "：" + translate(d) + '/' + response.msg, "modal-danger", "lg");
                }
            });
        };

        $scope.editCurWgt = function() {
            var wgt = _.find($scope.widgetList, function (w) {
                return w.id == $scope.widgetId;
            });
            if (wgt) {
                $scope.editWgt(wgt);
            }
        };

        var doEditWgt = function (widget) {
            cleanPreview();
            $timeout(function () {
                switchNode(widget.id)
            }, 500);
            switchNode(widget.id);
            $('#preview_widget').html('');
            $scope.curWidget = angular.copy(widget.data);
            if (!$scope.curWidget.expressions) {
                $scope.curWidget.expressions = [];
            }
            if (!$scope.curWidget.filterGroups) {
                $scope.curWidget.filterGroups = [];
            }
            updateService.updateConfig($scope.curWidget.config);
            $scope.datasource = _.find($scope.datasourceList, function (ds) {
                return ds.id == widget.data.datasource;
            });

            $scope.widgetName = angular.copy(widget.categoryName + "/" + widget.name);

            $scope.widgetId = widget.id;
            $scope.optFlag = 'edit';
            $scope.customDs = _.isUndefined($scope.curWidget.datasetId);
            loadDataset(function () {
                loadDsExpressions();
                loadDsFilterGroups();
                buildSchema();
                dataService.linkDataset($scope.curWidget.datasetId, $scope.curWidget.config);
            });
            addWatch();
        };

        $scope.doCancel = function() {
            if ($scope.optFlag == 'new') {
                $scope.newConfig();
                $scope.filterSelect = {};
                cleanPreview();
            } else {
                $scope.editCurWgt();
            }
        }

        $scope.filterDimension = function (e) {
            if (e.type == 'level') {
                return true;
            }
            var keys = _.find($scope.curWidget.config.keys, function (k) {
                return k.col == e.column;
            });
            var groups = _.find($scope.curWidget.config.groups, function (k) {
                return k.col == e.column;
            });
            return !(keys || groups);
        };

        $scope.filterExpressions = function (e) {
            var result = false;
            _.each($scope.curWidget.config.values, function (v) {
                _.each(v.cols, function (c) {
                    if (c.type == 'exp') {
                        if (e.id == c.id && e.alias == c.alias) {
                            result = true;
                        }
                    }
                });
            });
            return !result;
        };

        $scope.filterFilterGroup = function (e) {
            var result = false;
            _.each($scope.curWidget.config.filters, function (f) {
                if (f.group) {
                    if (e.id == f.id && e.group == f.group) {
                        result = true;
                    }
                }
            });
            return !result;
        };

        var buildSchema = function () {
            var loadFromDataset = false;
            if (!$scope.customDs) {
                $scope.dataset = _.find($scope.datasetList, function (ds) {
                    return ds.id == $scope.curWidget.datasetId;
                });
                if ($scope.dataset.data.schema && ($scope.dataset.data.schema.measure.length > 0 || $scope.dataset.data.schema.dimension.length > 0)) {
                    loadFromDataset = true;
                }
            }
            if (loadFromDataset) {
                $scope.schema = $scope.dataset.data.schema;
                $scope.alerts = [];
            } else {
                $scope.loading = true;
                dataService.getColumns({
                    datasource: $scope.datasource ? $scope.datasource.id : null,
                    query: $scope.curWidget.query,
                    datasetId: $scope.customDs ? undefined : $scope.curWidget.datasetId,
                    reload: !$scope.loadFromCache,
                    callback: function (dps) {
                        $scope.loading = false;
                        $scope.alerts = [];
                        if (dps.msg == "1") {
                            $scope.schema = {selects: []};
                            _.each(dps.columns, function (e) {
                                $scope.schema.selects.push({column: e});
                            });
                        } else {
                            $scope.alerts = [{msg: dps.msg, type: 'danger'}];
                        }
                    }
                });
            }
        };

        $scope.deleteWgt = function (widget) {
            ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-info", "lg", function () {
                $http.post("dashboard/deleteWidget.do", {id: widget.id}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getWidgetList();
                    } else {
                        ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                    }
                    $scope.optFlag == 'none';
                });
            });
        };

        $scope.copyWgt = function (widget) {
            var o = angular.copy(widget);
            o.name = o.name + "_copy";
            $http.post("dashboard/saveNewWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getWidgetList();
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
                $scope.optFlag == 'none';
            });
        };

        $scope.getQueryView = function () {
            if ($scope.datasource && $scope.datasource.name) {
                return 'dashboard/getConfigView.do?type=' + $scope.datasource.type;
            }
        };

        $scope.getChartView = function () {
            if ($scope.curWidget.config && $scope.curWidget.config.chart_type) {
                return 'org/cboard/view/config/chart/' + $scope.curWidget.config.chart_type + '.html';
            }
        };

        $scope.getOptionsView = function() {
            var basePath = 'org/cboard/view/config/chart/options/';
            if ($scope.curWidget.config && $scope.curWidget.config.chart_type) {
                return basePath + $scope.curWidget.config.chart_type + '.html';
            }
        }

        $scope.deleteValue = function (cols) {
            _.each(cols, function (e) {
                if (e.type == 'exp') {
                    $scope.expressions.push(e);
                } else {
                    $scope.curWidget.config.selects.push(e.col);
                }
            });
        };

        $scope.dndTransfer = {
            toCol: function (list, index, item, type) {
                if (type == 'key' || type == 'group' || type == 'filter') {
                    list[index] = {col: item.col, aggregate_type: 'sum'};
                } else if (type == 'select' || type == 'measure') {
                    list[index] = {col: item.column, aggregate_type: 'sum'};
                }
            },
            toSelect: function (list, index, item, type) {
                if (type == 'col') {
                    list[index] = item.col;
                } else if (type == 'key' || type == 'group' || type == 'filter') {
                    list[index] = item.col;
                }
            },
            toKeysGroups: function (list, index, item, type) {
                if (type == 'col') {
                    list[index] = {col: item.col, type: 'eq', values: [], sort: 'asc'};
                } else if (type == 'dimension' || type == 'select') {
                    list[index] = {
                        alias: item.alias,
                        col: item.column,
                        level: item.level,
                        type: 'eq',
                        values: [],
                        sort: 'asc'
                    };
                    if (type == 'dimension') {
                        list[index].id = item.id;
                    }
                }
            },
            attachLevel: function (column, level) {
                column.level = level.alias;
                return column;
            }
        };

        $scope.selectsByFilter = [];
        $scope.selects = [];
        $scope.editFilter = function (setbackArr, setbackIdx) {
            $uibModal.open({
                templateUrl: 'org/cboard/view/dashboard/modal/param.html',
                windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                backdrop: false,
                size: 'lg',
                resolve: {
                    param: function () {
                        var item = setbackArr[setbackIdx];
                        if (item.col) {
                            if (item.type == 'eq') {
                                item.type = '=';
                            } else if (item.type == 'ne') {
                                item.type = '≠';
                            }
                            return angular.copy(item);
                        } else {
                            return {col: item, type: '=', values: []}
                        }
                    },
                    filter: function () {
                        return true;
                    },
                    getSelects: function () {
                        return function (byFilter, column, callback) {
                            var config = undefined;
                            if (byFilter) {
                                config = angular.copy($scope.curWidget.config);
                                var arr = _.findKey($scope.curWidget.config, function (o) {
                                    return o == setbackArr;
                                });
                                config[arr].splice(setbackIdx, 1);
                            }
                            dataService.getDimensionValues($scope.datasource ? $scope.datasource.id : null, $scope.curWidget.query, $scope.customDs ? undefined : $scope.curWidget.datasetId, column, config, function (filtered) {
                                callback(filtered);
                            });
                        };
                    },
                    ok: function () {
                        return function (param) {
                            setbackArr[setbackIdx] = param;
                        }
                    }
                },
                controller: 'paramSelector'
            });
        };

        $scope.editVFilter = function (o) {
            $uibModal.open({
                templateUrl: 'org/cboard/view/config/modal/vfilter.html',
                windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                backdrop: false,
                size: 'lg',
                controller: function ($scope, $uibModalInstance) {
                    $scope.type = ['=', '≠', '>', '<', '≥', '≤', '(a,b]', '[a,b)', '(a,b)', '[a,b]'];
                    $scope.f_type = o.f_type ? o.f_type : '>';
                    $scope.f_values = o.f_values ? o.f_values : [];
                    $scope.f_top = o.f_top ? o.f_top : '';
                    $scope.close = function () {
                        $uibModalInstance.close();
                    };
                    $scope.ok = function () {
                        o.f_type = $scope.f_type;
                        o.f_values = $scope.f_values;
                        o.f_top = $scope.f_top;
                        $uibModalInstance.close();
                    };
                }
            });
        };

        var schemaToSelect = function (schema) {
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
                return angular.copy(selects);
            }
        };

        $scope.editFilterGroup = function (col) {
            var selects = schemaToSelect($scope.schema);
            $uibModal.open({
                templateUrl: 'org/cboard/view/config/modal/filterGroup.html',
                windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                backdrop: false,
                scope: $scope,
                controller: function ($scope, $uibModalInstance) {
                    if (col) {
                        $scope.data = angular.copy(col);
                    } else {
                        $scope.data = {group: '', filters: []};
                    }
                    $scope.selects = selects;
                    $scope.close = function () {
                        $uibModalInstance.close();
                    };
                    $scope.addColumn = function (str) {
                        $scope.data.filters.push({col: str, type: '=', values: []})
                    };
                    $scope.ok = function () {
                        if (col) {
                            col.group = $scope.data.group;
                            col.filters = $scope.data.filters;
                        } else {
                            $scope.curWidget.filterGroups.push($scope.data);
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
                                        dataService.getDimensionValues($scope.datasource ? $scope.datasource.id : null, $scope.curWidget.query, $scope.curWidget.datasetId, column, undefined, function (filtered) {
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

        $scope.editSort = function (o) {
            switch (o.sort) {
                case 'asc':
                    o.sort = 'desc';
                    break;
                case 'desc':
                    o.sort = undefined;
                    break;
                default:
                    o.sort = 'asc';
                    break;
            }
        };

        $scope.cleanVSort = function () {
            _.each($scope.curWidget.config.values, function (v) {
                _.each(v.cols, function (c) {
                    c.sort = undefined;
                });
            });
        };

        $scope.editAlign = function (o) {
            switch (o.align) {
                case undefined:
                    o.align = 'left';
                    break;
                case 'left':
                    o.align = 'right';
                    break;
                default:
                    o.align = undefined;
                    break;
            }
        };

        $scope.cleanRowSort = function (o) {
            var sort = o.sort;
            _.each($scope.curWidget.config.keys, function (k) {
                k.sort = undefined;
            });
            $scope.cleanVSort();
            o.sort = sort;
        };

        $scope.showTooltip = function (chart, e) {
            if (chart.isDisabled) {
                return;
            }
            var $curTarget = $(e.currentTarget),
                _tooltip = $curTarget.find(".chart-tip");
            _tooltip.show();
        };
        $scope.hideTooltip = function (chart, e) {
            if (chart.isDisabled) {
                return;
            }
            var $curTarget = $(e.currentTarget),
                _tooltip = $curTarget.find(".chart-tip");
            _tooltip.hide();
        };

        /** js tree related start... **/
        $scope.treeConfig = jsTreeConfig1;

        $("#" + treeID).keyup(function (e) {
            if (e.keyCode == 46) {
                $scope.deleteNode();
            }
        });

        var getSelectedWidget = function () {
            var selectedNode = jstree_GetSelectedNodes(treeID)[0];
            return _.find($scope.widgetList, function (w) {
                return w.id == selectedNode.id;
            });
        };

        var checkTreeNode = function (actionType) {
            return jstree_CheckTreeNode(actionType, treeID, ModalUtils.alert);
        };

        var switchNode = function (id) {
            $scope.ignoreChanges = false;
            var widgetTree = jstree_GetWholeTree(treeID);
            widgetTree.deselect_all();
            widgetTree.select_node(id);
        };

        $scope.applyModelChanges = function () {
            return !$scope.ignoreChanges;
        };

        $scope.copyNode = function () {
            if (!checkTreeNode("copy")) return;
            $scope.copyWgt(getSelectedWidget());
        };

        $scope.editNode = function () {
            if (!checkTreeNode("edit")) return;
            $scope.editWgt(getSelectedWidget());
        };

        $scope.deleteNode = function () {
            if (!checkTreeNode("delete")) return;
            $scope.deleteWgt(getSelectedWidget());
        };
        $scope.searchNode = function () {
            var para = {wgtName: '', dsName: '', dsrName: ''};

            //map widgetList to list (add datasetName and datasourceName)
            var list = $scope.widgetList.map(function (w) {
                var ds = _.find($scope.datasetList, function (obj) {
                    return obj.id == w.data.datasetId
                });
                var dsrName = '';
                var dsr;
                if (ds) {
                    dsr = _.find($scope.datasourceList, function (obj) {
                        return obj.id == ds.data.datasource
                    });
                } else if (w.data.datasource) {
                    dsr = _.find($scope.datasourceList, function (obj) {
                        return obj.id == w.data.datasource
                    });
                }
                return {
                    "id": w.id,
                    "name": w.name,
                    "categoryName": w.categoryName,
                    "datasetName": ds ? ds.name : '',
                    "datasourceName": dsr ? dsr.name : dsrName
                };
            });

            //split search keywords
            if ($scope.keywords) {
                if ($scope.keywords.indexOf(' ') == -1 && $scope.keywords.indexOf(':') == -1) {
                    para.wgtName = $scope.keywords;
                } else {
                    var keys = $scope.keywords.split(' ');
                    for (var i = 0; i < keys.length; i++) {
                        var w = keys[i].trim();
                        if (w.split(':')[0] == 'wg') {
                            para["wgtName"] = w.split(':')[1];
                        }
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
                $filter('filter')(list, {name: para.wgtName, datasetName: para.dsName, datasourceName: para.dsrName})
            );

            jstree_ReloadTree(treeID, originalData);
        };

        $scope.treeEventsObj = function () {
            var baseEventObj = jstree_baseTreeEventsObj({
                ngScope: $scope, ngHttp: $http, ngTimeout: $timeout,
                treeID: treeID, listName: "widgetList", updateUrl: updateUrl
            });
            return baseEventObj;
        }();

        $scope.doConfigParams = function () {
            $http.get('dashboard/getConfigParams.do?type=' + $scope.datasource.type + '&page=widget.html').then(function (response) {
                $scope.params = response.data;
            });
        };

        $scope.changeDs = function () {
            $scope.curWidget.query = {};
            $http.get('dashboard/getConfigParams.do?type=' + $scope.datasource.type + '&page=widget.html').then(function (response) {
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

        $scope.setCities = function () {
            var province = _.find($scope.provinces, function (e) {
                return e.code == $scope.curWidget.config.province.code;
            });
            if(province && province.cities){
                $scope.cities = province.cities
            }else if($scope.curWidget.config.city && $scope.curWidget.config.city.code){
                $scope.curWidget.config.city.code="";
            }
        }
        /** js tree related End... **/


        /** Ace Editor Starer... **/
        $scope.queryAceOpt = datasetEditorOptions();
    }
)
;
