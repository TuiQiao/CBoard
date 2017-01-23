/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartService', function ($q, dataService, chartPieService, chartLineService, chartFunnelService,
                                         chartSankeyService, chartTableService, chartKpiService, chartRadarService, chartMapService) {

        this.render = function (containerDom, widget, optionFilter, scope, reload) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var chart = getChartServices(widget.config);
            dataService.getData(widget.datasource, widget.query, widget.datasetId, widget.config, function (data) {
                var option = chart.parseOption(data, widget.config);
                if (optionFilter) {
                    optionFilter(option);
                }
                deferred.resolve(chart.render(containerDom, option, scope));
            }, reload);
            return promise;
        };


        this.realTimeRender = function (realTimeTicket, widget, optionFilter, scope) {
            if (!realTimeTicket) {
                return;
            }
            var chart = getChartServices(widget.config);
            dataService.getData(widget.datasource, widget.query, widget.datasetId, widget.config, function (data) {
                var option = chart.parseOption(data, widget.config);
                if (optionFilter) {
                    optionFilter(option);
                }
                realTimeTicket(option);
            });
        };

        var getChartServices = function (chartConfig) {
            var chart;
            switch (chartConfig.chart_type) {
                case 'line':
                    chart = chartLineService;
                    break;
                case 'pie':
                    chart = chartPieService;
                    break;
                case 'kpi':
                    chart = chartKpiService;
                    break;
                case 'table':
                    chart = chartTableService;
                    break;
                case 'funnel':
                    chart = chartFunnelService;
                    break;
                case 'sankey':
                    chart = chartSankeyService;
                    break;
                case 'radar':
                    chart = chartRadarService;
                    break;
                case 'map':
                    chart = chartMapService;
                    break;
            }
            return chart;
        };

    }
);