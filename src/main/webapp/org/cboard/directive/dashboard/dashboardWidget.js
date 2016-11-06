/**
 * Created by yfyuan on 2016/8/8.
 */

cBoard.directive('dashboardWidget', function ($compile, $templateCache, dataService, chartService) {

    var renderEchart = function (scope, element, attrs) {
        var template = $templateCache.get("echartContent");
        scope.myheight = scope.row.height ? (scope.row.height - 44) : 300;
        var link = $compile(template);
        element.append(link(scope));
        var ndWrapper = $(element).find('.box-body');
        scope.widget.realTimeTicket = chartService.render(ndWrapper, scope.widget.widget.queryData, scope.widget.widget.data.config);
    };

    var renderKpi = function (scope, element, attrs) {
        var template = $templateCache.get("kpiContent");
        var aa = $compile(template)(scope);
        element.append(aa);
        var ndWrapper = $(element).find('.kpi-body');
        scope.widget.realTimeTicket = chartService.render(ndWrapper, scope.widget.widget.queryData, scope.widget.widget.data.config, null, scope);
    };

    var renderTable = function (scope, element, attrs) {
        var template = $templateCache.get("tableContent");
        scope.myheight = scope.row.height ? (scope.row.height - 44) : 300;
        var aa = $compile(template)(scope);
        element.append(aa);
        var ndWrapper = $(element).find('.box-body');
        scope.widget.realTimeTicket = chartService.render(ndWrapper, scope.widget.widget.queryData, scope.widget.widget.data.config, null, scope);
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
                        case 'funnel':
                            renderEchart(scope, element, attrs);
                            break;
                        case 'sankey':
                            renderEchart(scope, element, attrs);
                            break;
                        case 'radar':
                            renderEchart(scope, element, attrs);
                            break;
                    }
                }
            }
        }
    };
});