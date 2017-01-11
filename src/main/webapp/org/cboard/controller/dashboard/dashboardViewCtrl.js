/**
 * Created by yfyuan on 2016/8/2.
 */

cBoard.controller('dashboardViewCtrl', function ($rootScope, $scope, $state, $stateParams, $http, ModalUtils, chartService, $interval, $uibModal, dataService) {

    $scope.loading = true;

    $http.get("dashboard/getDatasetList.do").success(function (response) {
        $scope.datasetList = response;
        $scope.realtimeDataset = {};
        $scope.datasetMeta = {};
        $scope.intervals = [];
        $scope.datasetFilters = {};
        $scope.load(false);
    });

    $http.post("/admin/isConfig.do", {type: 'widget'}).success(function (response) {
        $scope.widgetCfg = response;
    });

    var buildRender = function (w) {
        w.render = function (content, optionFilter, scope) {
            w.realTimeTicket = chartService.render(content, w.widget.queryData, w.widget.data.config, optionFilter, scope);
            w.realTimeOption = {optionFilter: optionFilter, scope: scope};
        };
        w.modalRender = function (content, optionFilter, scope) {
            w.modalRealTimeTicket = chartService.render(content, filterData(w.widget.id, w.widget.queryData), w.widget.data.config, optionFilter, scope);
            w.modalRealTimeOption = {optionFilter: optionFilter, scope: scope};
        };
    };

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
            if (fromState.controller == 'dashboardViewCtrl') {
                _.each($scope.intervals, function (i) {
                    $interval.cancel(i);
                })
            }
        }
    );

    $scope.load = function (reload) {
        _.each($scope.intervals, function (e) {
            $interval.cancel(e);
        });
        $scope.intervals = [];
        $http.get("dashboard/getBoardData.do?id=" + $stateParams.id).success(function (response) {
            $scope.loading = false;
            $scope.board = response;
            var queries = [];

            _.each($scope.board.layout.rows, function (row) {
                _.each(row.widgets, function (widget) {
                    if (!_.isUndefined(widget.hasRole) && !widget.hasRole) {
                        return;
                    }
                    var w = widget.widget.data;
                    var q;
                    for (var i = 0; i < queries.length; i++) {
                        if (queries[i].k == angular.toJson({d: w.datasource, q: w.query, s: w.datasetId})) {
                            q = queries[i];
                            break;
                        }
                    }
                    if (!q) {
                        q = {
                            k: angular.toJson({d: w.datasource, q: w.query, s: w.datasetId}),
                            datasource: w.datasource,
                            query: w.query,
                            datasetId: w.datasetId,
                            widgets: [widget]
                        };
                        queries.push(q);
                    } else {
                        q.widgets.push(widget);
                    }

                    //real time
                    var ds = _.find($scope.datasetList, function (e) {
                        return e.id == w.datasetId;
                    });
                    if (ds && ds.data.interval && ds.data.interval > 0) {
                        if (!$scope.realtimeDataset[ds.id]) {
                            $scope.realtimeDataset[ds.id] = [];
                        }
                        $scope.realtimeDataset[ds.id].push(widget);
                    }
                });

            });

            _.each($scope.board.layout.rows, function (row) {
                _.each(row.params, function (param) {
                    param.selects = [];
                    param.type = '=';
                    param.values = [];
                });
            });

            _.each(queries, function (q) {
                $http.post("dashboard/getCachedData.do", {
                    datasourceId: q.datasource,
                    query: angular.toJson(q.query),
                    datasetId: q.datasetId,
                    reload: reload
                }).success(function (response) {
                    _.each(q.widgets, function (w) {
                        w.widget.queryData = response.data;
                        buildRender(w);
                        w.show = true;
                    });

                    if (!_.isUndefined(q.datasetId)) {
                        $scope.datasetMeta[q.datasetId] = response.data[0];
                        var selectsByColumn = {};
                        _.each($scope.board.layout.rows, function (row) {
                            _.each(row.params, function (param) {
                                _.each(param.col, function (c) {
                                    if (c.datasetId == q.datasetId) {
                                        if (!selectsByColumn[c.column]) {
                                            selectsByColumn[c.column] = [];
                                        }
                                        selectsByColumn[c.column].push(param.selects);
                                    }
                                });
                            });
                        });
                        var selectsByIndex = {};
                        _.each(_.keys(selectsByColumn), function (column) {
                            for (var i = 0; i < response.data[0].length; i++) {
                                if (response.data[0][i] == column) {
                                    selectsByIndex[i] = selectsByColumn[column];
                                }
                            }
                        });
                        for (var i = 1; i < response.data.length; i++) {
                            _.each(_.keys(selectsByIndex), function (index) {
                                _.each(selectsByIndex[index], function (selects) {
                                    if (_.indexOf(selects, response.data[i][index]) < 0) {
                                        selects.push(response.data[i][index]);
                                    }

                                });
                            });
                        }
                    } else {
                        _.each(q.widgets, function (w) {
                            _.each($scope.board.layout.rows, function (row) {
                                _.each(row.params, function (param) {
                                    _.each(param.col, function (c) {
                                        if (c.widgetId == w.widgetId) {
                                            var index = _.indexOf(response.data[0], c.column);
                                            for (var i = 1; i < response.data.length; i++) {
                                                if (_.indexOf(param.selects, response.data[i][index]) < 0) {
                                                    param.selects.push(response.data[i][index]);
                                                }
                                            }
                                        }
                                    });
                                });
                            });
                        });
                    }
                }).error(function (data, header, config, status) {
                    console.log(status);
                });
            });

            //real time load task
            _.each(_.keys($scope.realtimeDataset), function (dsId) {
                var ds = _.find($scope.datasetList, function (e) {
                    return e.id == dsId;
                });
                $scope.intervals.push($interval(function () {
                    $http.post("dashboard/getCachedData.do", {
                        datasetId: ds.id,
                    }).success(function (response) {
                        _.each($scope.realtimeDataset[dsId], function (w) {
                            w.widget.queryData = response.data;
                            try {
                                chartService.realTimeRender(w.realTimeTicket, filterData(w.widget.id, w.widget.queryData), w.widget.data.config);
                                if (w.modalRealTimeTicket) {
                                    chartService.realTimeRender(w.modalRealTimeTicket, filterData(w.widget.id, w.widget.queryData), w.widget.data.config, w.modalRealTimeOption.optionFilter, null);
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        });
                    });
                }, ds.data.interval * 1000));
            });
        });
    };

    var filterData = function (widgetId, data) {
        var filter = $scope.widgetFilters ? $scope.widgetFilters[widgetId] : undefined;
        if (filter) {
            var result = [data[0]];
            for (var i = 1; i < data.length; i++) {
                if (filter(data[i])) {
                    result.push(data[i]);
                }
            }
            return result;
        }
        return data;
    };

    var getBoardWidgetByWidgetId = function (widgetId) {
        for (var i = 0; i < $scope.board.layout.rows.length; i++) {
            var row = $scope.board.layout.rows[i];
            for (var j = 0; row.widgets && j < row.widgets.length; j++) {
                if (row.widgets[j].widget.id == widgetId) {
                    return row.widgets[j];
                }
            }
        }
    };

    var getBoardWidgetByDatasetId = function (datasetId) {
        var result = [];
        _.each($scope.board.layout.rows, function (row) {
            _.each(row.widgets, function (w) {
                if (w.widget.data.datasetId == datasetId) {
                    result.push(w);
                }
            });
        });
        return result;
    };

    $scope.applyParamFilter = function () {
        $scope.widgetFilters = [];
        var widgetRules = {};
        var pushWidgetRules = function (widgetId, rule) {
            if (!widgetRules[widgetId]) {
                widgetRules[widgetId] = [];
            }
            widgetRules[widgetId].push(rule);
        };
        _.each($scope.board.layout.rows, function (row) {
            _.each(row.params, function (param) {
                if (param.values.length <= 0) {
                    return;
                }
                _.each(param.col, function (col) {
                    if (_.isUndefined(col.datasetId)) {
                        var w = getBoardWidgetByWidgetId(col.widgetId);
                        var idx = _.indexOf(w.widget.queryData[0], col.column);
                        var rule = dataService.getRule({
                            type: param.type,
                            values: param.values
                        }, idx);
                        pushWidgetRules(w.widget.id, rule);
                    } else {
                        var wArr = getBoardWidgetByDatasetId(col.datasetId);
                        var idx = _.indexOf($scope.datasetMeta[col.datasetId], col.column);
                        var rule = dataService.getRule({
                            type: param.type,
                            values: param.values
                        }, idx);
                        _.each(wArr, function (w) {
                            pushWidgetRules(w.widget.id, rule);
                        });
                    }
                });
            });
        });

        _.each(_.keys(widgetRules), function (widgetId) {
            $scope.widgetFilters[widgetId] = function (row) {
                for (var i = 0; i < widgetRules[widgetId].length; i++) {
                    if (!widgetRules[widgetId][i](row)) {
                        return false;
                    }
                }
                return true;
            };
        });

        _.each($scope.board.layout.rows, function (row) {
            _.each(row.widgets, function (w) {
                try {
                    chartService.realTimeRender(w.realTimeTicket, filterData(w.widget.id, w.widget.queryData), w.widget.data.config);
                } catch (e) {
                    console.error(e);
                }
            });
        });
    };

    $scope.modalChart = function (widget) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/util/modal/chart.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            windowClass: 'modal-fit',
            backdrop: false,
            controller: function ($scope, $uibModalInstance, chartService) {
                $scope.widget = widget;
                $scope.close = function () {
                    $uibModalInstance.close();
                    delete widget.modalRealTimeTicket;
                    delete widget.modalRealTimeOption;
                };
                $scope.render1 = function () {
                    widget.modalRender($('#modal_chart'), function (option) {
                        option.toolbox = {
                            feature: {
                                //saveAsImage: {},
                                dataView: {
                                    show: true,
                                    readOnly: true
                                },
                                magicType: {
                                    type: ['line', 'bar', 'stack', 'tiled']
                                },
                                dataZoom: {
                                    show: true
                                },
                                restore: {
                                    show: true
                                }
                            }
                        };
                    }, null);
                };
            }
        });
    };

    $scope.modalTable = function (widget) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/util/modal/chart.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            windowClass: 'modal-fit',
            backdrop: false,
            controller: function ($scope, $uibModalInstance, chartService) {
                $scope.widget = widget;
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.render1 = function () {
                    widget.modalRender($('#modal_chart'), null, null);
                };
            }
        });
    };

    $scope.config = function (widget) {
        $state.go('config.widget', {id: widget.widget.id});
    };

    $scope.reload = function (widget) {
        widget.show = false;
        $http.post("dashboard/getCachedData.do", {
            datasourceId: widget.widget.data.datasource,
            query: angular.toJson(widget.widget.data.query),
            datasetId: widget.widget.data.datasetId,
            reload: true
        }).success(function (response) {
            widget.widget.queryData = response.data;
            widget.show = true;
        });
    };
    var paramArr = [];
    $scope.editParam = function (param) {
        var ok = $scope.applyParamFilter;
        $uibModal.open({
            templateUrl: 'org/cboard/view/dashboard/modal/boardParam.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            controller: function ($scope, $uibModalInstance, dataService) {
                var paramSelects = _.sortBy(dataService.toNumber(param.selects));
                paramSelects.map(function (d, l) {
                    param.values.map(function (i) {
                        d == i ? paramSelects.splice(l, 1) : null;
                    });
                });
                $scope.selects = paramSelects;
                $scope.type = ['=', '≠', '>', '<', '≥', '≤', '(a,b]', '[a,b)', '(a,b)', '[a,b]'];
                $scope.param = param;
                $scope.operate = {};
                var showValues = function (operate, type) {
                    var equal = ['=', '≠'];
                    var openInterval = ['>', '<', '≥', '≤'];
                    var closeInterval = ['(a,b]', '[a,b)', '(a,b)', '[a,b]'];
                    operate.equal = $.inArray(type, equal) > -1 ? true : false;
                    operate.openInterval = $.inArray(type, openInterval) > -1 ? true : false;
                    operate.closeInterval = $.inArray(type, closeInterval) > -1 ? true : false;
                };
                showValues($scope.operate, $scope.param.type);
                $scope.selected = function (v) {
                    return _.indexOf($scope.param.values, v) == -1
                };
                $scope.selectedValues = function (ev) {
                    var opt = $scope.operate.equal ? 'equal' : ($scope.operate.openInterval ? 'openInterval' : 'closeInterval');
                    var select = ev.target.textContent;
                    var types = {
                        equal: function () {
                            param.values.push(select);
                            $scope.selects.map(function (d, i) {
                                d == select ? $scope.selects.splice(i, 1) : null;
                            });
                        },
                        openInterval: function () {
                            if (param.values.length == 0) {
                                param.values.push(select);
                                $scope.selects.map(function (d, i) {
                                    d == select ? $scope.selects.splice(i, 1) : null;
                                });
                            }
                        },
                        closeInterval: function () {
                            if (param.values[0] == null) {
                                param.values[0] = select;
                                $scope.selects.map(function (d, i) {
                                    d == select ? $scope.selects.splice(i, 1) : null;
                                });
                            } else if (param.values[1] == null) {
                                param.values[1] = select;
                                $scope.selects.map(function (d, i) {
                                    d == select ? $scope.selects.splice(i, 1) : null;
                                });
                            }
                        }
                    };
                    types[opt] ? types[opt]() : null;
                };
                $scope.filterType = function () {
                    $scope.param.values = [];
                    $scope.selects = _.sortBy(dataService.toNumber(param.selects));
                    showValues($scope.operate, $scope.param.type);
                };
                $scope.deleteSelected = function (ev) {
                    var select = ev.target.textContent;
                    $scope.selects.push(select);
                    $scope.selects = _.sortBy(dataService.toNumber($scope.selects));
                    $scope.param.values.map(function (d, i) {
                        d == select ? $scope.param.values.splice(i, 1) : null;
                    });
                };
                $scope.deleteDoubleValues = function (index) {
                    $scope.selects.push($scope.param.values[index]);
                    $scope.selects = _.sortBy(dataService.toNumber($scope.selects));
                    $scope.param.values[index] = null;
                };
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.ok = function () {
                    $uibModalInstance.close();
                    ok();
                    var paramObj = {};
                    var opt = $scope.operate.equal ? 'equal' : ($scope.operate.openInterval ? 'openInterval' : 'closeInterval');
                    var types = {
                        equal: function () {
                            paramObj.filter = $scope.param.type + ' (' + $scope.param.values + ')';
                        },
                        openInterval: function () {
                            paramObj.filter = $scope.param.type + ' ' + $scope.param.values;
                        },
                        closeInterval: function () {
                            var leftBrackets = $scope.param.type.split('a')[0];
                            var rightBrackets = $scope.param.type.split('b')[1];
                            paramObj.filter = 'between ' + leftBrackets + $scope.param.values[0] + ',' + $scope.param.values[1] + rightBrackets;
                        }
                    };
                    paramObj.name = $scope.param.name;
                    types[opt] ? types[opt]() : null;
                    var oldParam = _.find(paramArr, function (param) {
                        return param.name == paramObj.name;
                    });
                    if (oldParam) {
                        paramArr.map(function (d) {
                            if (d.name == oldParam.name) {
                                d.filter = paramObj.filter;
                            }
                        });
                    } else {
                        paramArr.push(paramObj);
                    }
                    var template = '';
                    paramArr.map(function (d) {
                        template += "<span class='filterParam'><span>" + d.name + "</span><span> :  " + d.filter + "</span></span>"
                    });
                    $('div.paramTemplate').html(template);
                };
            },
        });
    };
});