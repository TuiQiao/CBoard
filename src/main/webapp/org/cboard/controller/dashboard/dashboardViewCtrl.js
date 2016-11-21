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
                            chartService.realTimeRender(w.realTimeTicket, filterData(dsId, response.data), w.widget.data.config);
                        });
                    });
                }, ds.data.interval * 1000));

            });

        });

    };

    var filterData = function (datasetId, data) {
        var filter = $scope.datasetFilters[datasetId];
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

    $scope.applyParamFilter = function () {
        $scope.datasetFilters = [];
        var datasetRules = {};
        _.each($scope.board.layout.rows, function (row) {
            _.each(row.params, function (param) {
                _.each(param.col, function (col) {
                    $scope.datasetFilters[col.datasetId] = {};
                    if (param.values.length > 0) {
                        if (!datasetRules[col.datasetId]) {
                            datasetRules[col.datasetId] = [];
                        }
                        var idx = _.indexOf($scope.datasetMeta[col.datasetId], col.column);
                        datasetRules[col.datasetId].push(dataService.getRule({
                            type: param.type,
                            values: param.values
                        }, idx));
                    }
                });
            });
        });
        _.each(_.keys($scope.datasetFilters), function (dsId) {
            $scope.datasetFilters[dsId] = function (row) {
                for (var i = 0; datasetRules[dsId] && i < datasetRules[dsId].length; i++) {
                    if (!datasetRules[dsId][i](row)) {
                        return false;
                    }
                }
                return true;
            };

            _.each($scope.board.layout.rows, function (row) {
                _.each(row.widgets, function (w) {
                    if (w.widget.data.datasetId == dsId) {
                        chartService.realTimeRender(w.realTimeTicket, filterData(dsId, w.widget.queryData), w.widget.data.config);
                    }
                });
            });

            // $http.post("/dashboard/getCachedData.do", {
            //     datasetId: dsId,
            // }).success(function (response) {
            //
            // });
        });
    };

    $scope.modalChart = function (widget) {
        ModalUtils.chart(widget);
    };

    $scope.modalTable = function (widget) {
        ModalUtils.table(widget);
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