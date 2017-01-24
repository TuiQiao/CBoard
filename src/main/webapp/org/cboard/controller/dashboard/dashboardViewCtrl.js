/**
 * Created by yfyuan on 2016/8/2.
 */

cBoard.controller('dashboardViewCtrl', function ($timeout, $rootScope, $scope, $state, $stateParams, $http, ModalUtils, chartService, $interval, $uibModal, dataService) {

    $scope.loading = true;

    $http.get("dashboard/getDatasetList.do").success(function (response) {
        $scope.datasetList = response;
        $scope.realtimeDataset = {};
        $scope.datasetMeta = {};
        $scope.intervals = [];
        $scope.datasetFilters = {};
        $scope.widgetFilters = {};
        $scope.load(false);
    });

    $http.post("admin/isConfig.do", {type: 'widget'}).success(function (response) {
        $scope.widgetCfg = response;
    });

    var buildRender = function (w, reload) {
        w.render = function (content, optionFilter, scope) {
            chartService.render(content, w.widget.data, optionFilter, scope, reload).then(function (d) {
                w.realTimeTicket = d;
                w.loading = false;
            });
            w.realTimeOption = {optionFilter: optionFilter, scope: scope};
        };
        w.modalRender = function (content, optionFilter, scope) {
            w.modalRealTimeTicket = chartService.render(content, w.widget.data, optionFilter, scope);
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
        $scope.loading = true;
        _.each($scope.intervals, function (e) {
            $interval.cancel(e);
        });
        $scope.intervals = [];

        if ($scope.board) {
            _.each($scope.board.layout.rows, function (row) {
                _.each(row.widgets, function (widget) {
                    widget.show = false;
                });
            });
        }
        $http.get("dashboard/getBoardData.do?id=" + $stateParams.id).success(function (response) {
            $scope.loading = false;
            $scope.board = response;
            _.each($scope.board.layout.rows, function (row) {
                _.each(row.widgets, function (widget) {
                    if (!_.isUndefined(widget.hasRole) && !widget.hasRole) {
                        return;
                    }
                    buildRender(widget, reload);
                    widget.loading = true;
                    widget.show = true;
                    var w = widget.widget.data;
                    //real time load task
                    var ds = _.find($scope.datasetList, function (e) {
                        return e.id == w.datasetId;
                    });
                    if (ds && ds.data.interval && ds.data.interval > 0) {
                        $scope.intervals.push($interval(function () {
                            try {
                                chartService.realTimeRender(widget.realTimeTicket, widget.widget.data);
                                if (widget.modalRealTimeTicket) {
                                    chartService.realTimeRender(widget.modalRealTimeTicket, widget.widget.data, widget.modalRealTimeOption.optionFilter, null);
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        }, ds.data.interval * 1000));
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

            _.each($scope.board.layout.rows, function (row) {
                _.each(row.params, function (param) {
                    _.each(param.col, function (c) {
                        var p;
                        if (_.isUndefined(c.datasetId)) {
                            _.each($scope.board.layout.rows, function (row) {
                                _.each(row.widgets, function (widget) {
                                    if (widget.widget.id == c.widgetId) {
                                        p = {
                                            datasourceId: widget.widget.data.datasource,
                                            query: angular.toJson(widget.widget.data.query),
                                            datasetId: null
                                        };
                                    }
                                });
                            });
                        } else {
                            p = {datasourceId: null, query: null, datasetId: c.datasetId};
                        }
                        $http.post("dashboard/getDimensionValues.do", {
                            datasourceId: p.datasourceId,
                            query: p.query,
                            datasetId: p.datasetId,
                            colmunName: c.column
                        }).success(function (response) {
                            _.each(response[0], function (s) {
                                if (_.indexOf(param.selects, s) < 0) {
                                    param.selects.push(s);
                                }
                            });

                        });
                    });
                });
            });
        });
    };

    var injectFilter = function (widget) {
        widget.data.config.boardFilters = [];
        if (_.isUndefined(widget.data.datasetId)) {
            widget.data.config.boardFilters = $scope.widgetFilters[widget.id];
        } else {
            widget.data.config.boardFilters = $scope.datasetFilters[widget.id];
        }
        return widget;
    };

    $scope.applyParamFilter = function () {
        $scope.widgetFilters = [];
        $scope.datasetFilters = [];
        _.each($scope.board.layout.rows, function (row) {
            _.each(row.params, function (param) {
                if (param.values.length <= 0) {
                    return;
                }
                _.each(param.col, function (col) {
                    var p = {
                        col: col.column,
                        type: param.type,
                        values: param.values
                    };
                    if (_.isUndefined(col.datasetId)) {
                        if (!$scope.widgetFilters[col.widgetId]) {
                            $scope.widgetFilters[col.widgetId] = [];
                        }
                        $scope.widgetFilters[col.widgetId].push(p);
                    } else {
                        if (!$scope.datasetFilters[col.datasetId]) {
                            $scope.datasetFilters[col.datasetId] = [];
                        }
                        $scope.datasetFilters[col.datasetId].push(p);
                    }
                });
            });
        });

        _.each($scope.board.layout.rows, function (row) {
            _.each(row.widgets, function (w) {
                try {
                    chartService.realTimeRender(w.realTimeTicket, injectFilter(w.widget).data);
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
        widget.render = function (content, optionFilter, scope) {
            chartService.render(content, widget.widget.data, optionFilter, scope, true).then(function (d) {
                widget.realTimeTicket = d;
                widget.loading = false;
            });
            widget.realTimeOption = {optionFilter: optionFilter, scope: scope};
        };
        $timeout(function () {
            widget.loading = true;
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
                var paramSelects = param.selects;
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