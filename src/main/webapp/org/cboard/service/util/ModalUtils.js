/**
 * Created by yfyuan on 2016/8/26.
 */

cBoard.service('ModalUtils', function ($uibModal, dataService, $filter) {

    var translate = $filter('translate');

    this.alert = function (content, style, size, callback) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/util/modal/alert.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            windowClass: style,
            size: size,
            controller: function ($scope, $uibModalInstance) {
                $scope.content = content;
                $scope.ok = function () {
                    $uibModalInstance.close();
                    if (callback) {
                        callback();
                    }
                };
            }
        });
    };

    this.confirm = function (content, style, size, ok, close) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/util/modal/confirm.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            windowClass: style,
            size: size,
            controller: function ($scope, $uibModalInstance) {
                $scope.content = content;
                $scope.ok = function () {
                    $uibModalInstance.close();
                    if (ok) {
                        ok();
                    }
                };
                $scope.close = function () {
                    $uibModalInstance.close();
                    if (close) {
                        close();
                    }
                };
            }
        });
    };

    this.chart = function (widget) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/util/modal/chart.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            windowClass: 'modal-fit',
            backdrop: false,
            controller: function ($scope, $uibModalInstance) {
                $scope.widget = widget;
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.render1 = function () {
                    var echartOption = dataService.parseEchartOption(widget.widget.queryData, widget.widget.data.config);
                    echartOption.toolbox = {
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
                    new CBoardEChartRender($('#modal_chart'), echartOption).chart();
                };
            }
        });
    };

    this.table = function (widget) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/util/modal/chart.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            windowClass: 'modal-fit',
            backdrop: false,
            controller: function ($scope, $uibModalInstance) {
                $scope.widget = widget;
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.render1 = function () {
                    var option = dataService.parseTableOption(widget.widget.queryData, widget.widget.data.config);
                    new CBoardTableRender($('#modal_chart'), option).do();
                };
            }
        });
    };
});