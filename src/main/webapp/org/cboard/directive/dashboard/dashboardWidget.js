/**
 * Created by yfyuan on 2016/8/8.
 */

cBoard.directive('dashboardWidget', function ($compile, $templateCache, dataService) {

    var renderEchart = function (scope, element, attrs) {
        var template = $templateCache.get("echartContent");
        scope.myheight = scope.row.height ? (scope.row.height - 44) : 300;
        var link = $compile(template);
        element.append(link(scope));
        var echartOption = dataService.parseEchartOption(scope.widget.widget.queryData, scope.widget.widget.data.config);
        var ndWrapper = $(element).find('.box-body');
        new CBoardEChartRender(ndWrapper, echartOption).chart();
    };

    var renderKpi = function (scope, element, attrs) {
        var template = $templateCache.get("kpiContent");
        var aa = $compile(template)(scope);
        element.append(aa);
        var option = dataService.parseKpiOption(scope.widget.widget.queryData, scope.widget.widget.data.config);
        var ndWrapper = $(element).find('.kpi-body');
        var html = new CBoardKpiRender(ndWrapper, option).rendered();
        aa = $compile(html)(scope);
        ndWrapper.append(aa);
    };

    var renderTable = function (scope, element, attrs) {
        var template = $templateCache.get("tableContent");
        scope.myheight = scope.row.height ? (scope.row.height - 44) : 300;
        var aa = $compile(template)(scope);
        element.append(aa);
        var tableOption = dataService.parseTableOption(scope.widget.widget.queryData, scope.widget.widget.data.config);
        var ndWrapper = $(element).find('.box-body');
        new CBoardTableRender(ndWrapper, tableOption).do(scope.myheight - 20);
    };

    return {
        restrict: 'E',
        scope: true,
        compile: function (element, attrs) {
            return {
                pre: function (scope, element, attrs) {
                },
                post: function (scope, element, attrs) {
                    switch (scope.widget.widget.data.config.chart_type) {
                        case 'line':
                            renderEchart(scope, element, attrs);
                            break;
                        case 'pie':
                            renderEchart(scope, element, attrs);
                            break;
                        case 'kpi':
                            renderKpi(scope, element, attrs);
                            break;
                        case 'table':
                            renderTable(scope, element, attrs);
                            break;
                    }
                }
            }
        }
    };
});