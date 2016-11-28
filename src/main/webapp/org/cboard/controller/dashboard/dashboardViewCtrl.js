/**
 * Created by yfyuan on 2016/8/2.
 */

cBoard.controller('dashboardViewCtrl', function ($scope, $state, $stateParams, $http, ModalUtils, chartService, $interval, $uibModal, dataService) {

    $scope.loading = true;

    $http.get("/dashboard/getDatasetList.do").success(function (response) {
        $scope.datasetList = response;
        $scope.realtimeDataset = {};
        $scope.datasetMeta = {};
        $scope.intervals = [];
        $scope.datasetFilters = {};
        $scope.load(false);
    });

    var buildRender = function (w) {
        w.render = function (content, optionFilter, scope) {
            w.realTimeTicket = chartService.render(content, w.widget.queryData, w.widget.data.config, optionFilter, scope);
            w.realTimeOption = {optionFilter: optionFilter, scope: scope};
        };
        w.modalRender = function (content, optionFilter, scope) {
            w.modalRealTimeTicket = chartService.render(content, w.widget.queryData, w.widget.data.config, optionFilter, scope);
            w.modalRealTimeOption = {optionFilter: optionFilter, scope: scope};
        };
    };

    $scope.load = function (reload) {
        _.each($scope.intervals, function (e) {
            $interval.cancel(e);
        });
        $scope.intervals = [];
        $http.get("/dashboard/getBoardData.do?id=" + $stateParams.id).success(function (response) {
            $scope.loading = false;
            $scope.board = response;
            var queries = [];

            _.each($scope.board.layout.rows, function (row) {
                _.each(row.widgets, function (widget) {
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
                $http.post("/dashboard/getCachedData.do", {
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
                });
            });

            //real time load task
            _.each(_.keys($scope.realtimeDataset), function (dsId) {
                var ds = _.find($scope.datasetList, function (e) {
                    return e.id == dsId;
                });
                $scope.intervals.push($interval(function () {
                    $http.post("/dashboard/getCachedData.do", {
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
        $http.post("/dashboard/getCachedData.do", {
            datasourceId: widget.widget.data.datasource,
            query: angular.toJson(widget.widget.data.query),
            datasetId: widget.widget.data.datasetId,
            reload: true
        }).success(function (response) {
            widget.widget.queryData = response.data;
            widget.show = true;
        });
    };

    $scope.editParam = function (param) {
        var ok = $scope.applyParamFilter;
        $uibModal.open({
            templateUrl: 'org/cboard/view/dashboard/modal/filter.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            controller: function ($scope, $uibModalInstance, dataService) {
                $scope.selects = _.sortBy(dataService.toNumber(param.selects));
                $scope.type = ['=', '≠', '>', '<', '≥', '≤', '(a,b]', '[a,b)', '(a,b)', '[a,b]'];
                $scope.param = param;
                $scope.selected = function (v) {
                    return _.indexOf($scope.param.values, v) == -1
                };
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.ok = function () {
                    $uibModalInstance.close();
                    ok();
                };
            }
        });
    };

});