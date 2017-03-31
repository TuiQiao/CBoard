/**
 * Created by yfyuan on 2017/3/28.
 */
'user strict';
cBoard.controller('paramCtrl', function ($scope, $uibModal, $http) {

    var evalValue = function (value) {
        if (isNaN(Number(value))) {
            var now = function (i, key) {
                if (i == undefined) {
                    return +moment();
                }
                return +moment().add(i, key);
            };
            var interval = function (i, key) {
                if (i == undefined) {
                    i == 1
                }
                var y = 0;
                switch (key) {
                    case 'h':
                        y = 60 * 60 * 1000;
                        break;
                    case 'd':
                        y = 24 * 60 * 60 * 1000;
                        break;
                    case 'm':
                        y = 60 * 1000;
                        break;
                    case 's':
                        y = 1000;
                        break;
                }
                return i * y;
            };
            return eval(value);
        } else {
            return value;
        }
    };

    var formatter = function (d, f) {
        if (_.isUndefined(f)) {
            return d;
        } else {
            return moment(d).format(f);
        }
    };

    $scope.init = function () {
        $scope.param = $scope.$parent.param;
        $scope.param.selects = [];
        $scope.param.type = '=';
        $scope.param.values = [];
        if ($scope.param.paramType == 'slider') {
            var cfg = $scope.param.cfg;
            var _max = evalValue(_.result(cfg, 'max', null));
            var _min = evalValue(_.result(cfg, 'min', null));
            var apply = _.debounce($scope.$parent.applyParamFilter, 800);
            $scope.slider = {
                minValue: _max - Number(evalValue(_.result(cfg, 'range', 0))),
                maxValue: _max,
                options: {
                    floor: _min,
                    ceil: _max,
                    draggableRange: true,
                    enforceStep: false,
                    maxRange: Number(evalValue(_.result(cfg, 'maxRange', null))),
                    step: evalValue(_.result(cfg, 'step', 1 * 60 * 1000)),
                    translate: function (value) {
                        return formatter(value, cfg.formatter);
                    },
                    onChange: function (sliderId, modelValue, highValue, pointerType) {
                        $scope.param.type = '[a,b]';
                        $scope.param.values = [formatter(modelValue, cfg.value_fmt), formatter(highValue, cfg.value_fmt)];
                        apply();
                    }
                }
            };
            $scope.param.type = '[a,b]';
            $scope.param.values = [$scope.slider.minValue, $scope.slider.maxValue];
            $scope.param.refresh = function () {
                if ($scope.slider.maxValue == $scope.slider.options.ceil) {
                    var _range = $scope.slider.maxValue - $scope.slider.minValue;
                    var cfg = $scope.param.cfg;
                    var max = evalValue(_.result(cfg, 'max', null));
                    var min = evalValue(_.result(cfg, 'min', null));
                    $scope.slider.maxValue = max;
                    $scope.slider.minValue = max - _range;
                    $scope.slider.options.floor = min;
                    $scope.slider.options.ceil = max;
                    $scope.param.type = '[a,b]';
                    $scope.param.values = [$scope.slider.minValue, $scope.slider.maxValue];
                }
            }
        } else {
            _.each($scope.param.col, function (c) {
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
                        if (_.indexOf($scope.param.selects, s) < 0) {
                            $scope.param.selects.push(s);
                        }
                    });

                });
            });
        }
        $scope.$emit('paramInitFinish', $scope.param);
    };

    var paramArr = [];
    $scope.editParam = function () {
        var param = $scope.param;
        var ok = $scope.applyParamFilter;
        $uibModal.open({
            templateUrl: 'org/cboard/view/dashboard/modal/boardParam.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            controller: function ($scope, $uibModalInstance, dataService) {
                var paramSelects = angular.copy(param.selects);
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
