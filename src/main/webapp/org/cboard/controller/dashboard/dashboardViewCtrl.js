/**
 * Created by yfyuan on 2016/8/2.
 */

cBoard.controller('dashboardViewCtrl', function ($scope, $state, $stateParams, $http, ModalUtils, chartService, $interval) {

    $scope.loading = true;

    $http.get("/dashboard/getDatasetList.do").success(function (response) {
        $scope.datasetList = response;
        $scope.datasets = {};
        $scope.intervals = [];
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
                        if (!$scope.datasets[ds.id]) {
                            $scope.datasets[ds.id] = [];
                        }
                        $scope.datasets[ds.id].push(widget);
                    }
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
                });
            });

            //real time load task
            _.each(_.keys($scope.datasets), function (dsId) {
                var ds = _.find($scope.datasetList, function (e) {
                    return e.id == dsId;
                });
                $scope.intervals.push($interval(function () {
                    $http.post("/dashboard/getCachedData.do", {
                        datasetId: ds.id,
                    }).success(function (response) {
                        _.each($scope.datasets[dsId], function (w) {
                            w.widget.queryData = response.data;
                            chartService.realTimeRender(w.realTimeTicket, w.widget.queryData, w.widget.data.config);
                        });
                    });
                }, ds.data.interval * 1000));

            });

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

});