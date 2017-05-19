/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartService', function ($q, dataService, chartPieService, chartLineService, chartFunnelService,
                                         chartSankeyService, chartTableService, chartKpiService, chartRadarService, chartMapService, chartScatterService) {

        this.render = function (containerDom, widget, optionFilter, scope, reload, persist) {
            var deferred = $q.defer();
            var chart = getChartServices(widget.config);

                dataService.getDataSeries(widget.datasource, widget.query, widget.datasetId, widget.config, function (data) {
                    try {
                        var option = chart.parseOption(data);
                        if (optionFilter) {
                            optionFilter(option);
                        }
                    }finally {
                        deferred.resolve(chart.render(containerDom, option, scope, persist));
                    }
                }, reload);

            return deferred.promise;
        };


        this.realTimeRender = function (realTimeTicket, widget, optionFilter, scope) {
            if (!realTimeTicket) {
                return;
            }
            var chart = getChartServices(widget.config);
            dataService.getDataSeries(widget.datasource, widget.query, widget.datasetId, widget.config, function (data) {
                var option = chart.parseOption(data);
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
                case 'scatter':
                    chart = chartScatterService;
                    break;
            }
            return chart;
        };

    }
);