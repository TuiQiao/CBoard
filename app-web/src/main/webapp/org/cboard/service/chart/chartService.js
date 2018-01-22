/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartService', function ($q, dataService, chartPieService, chartLineService, chartFunnelService,
                                         chartSankeyService, chartTableService, chartKpiService, chartRadarService,
                                         chartMapService, chartScatterService, chartGaugeService, chartWordCloudService,
                                         chartTreeMapService, chartAreaMapService, chartHeatMapCalendarService, chartHeatMapTableService,
                                         chartLiquidFillService, chartContrastService, chartChinaMapService, chartChinaMapBmapService,
                                         chartRelationService) {

        this.renderChart = function (containerDom, widgetConfig, options) {
            var deferred = $q.defer();
            var optionFilter = _.get(options, 'optionFilter'),
                scope = _.get(options, 'scope'),
                reload = _.get(options, 'reload'),
                persist = _.get(options, 'persist'),
                relations = _.get(options, 'relations');
            var chartServiceInstance = getChartServices(widgetConfig.config);
            dataService.getDataSeries({
                datasource: widgetConfig.datasource,
                query: widgetConfig.query,
                datasetId: widgetConfig.datasetId,
                chartConfig: widgetConfig.config,
                reload: reload
            }).then(function (data) {
                try {
                    var option = chartServiceInstance.parseOption(data);
                    if (optionFilter) {
                        optionFilter(option);
                    }
                    if (data.drill) {
                        data.drill.drillDown = function (id, value, render) {
                            dataService.getDrillPath(widgetConfig.datasetId, id).then(function (path) {
                                var i = 0;
                                _.each(path, function (e, _i) {
                                    if (e.id == id) {
                                        i = _i;
                                    }
                                });
                                var node = path[++i];
                                _.find(widgetConfig.config.keys, function (e, _i) {
                                    if (e.id == id) {
                                        e.type = '=';
                                        e.values = [value];
                                        if (!_.find(widgetConfig.config.keys, function (e) {
                                                return e.id == node.id;
                                            })) {
                                            widgetConfig.config.keys.splice(_i + 1, 0, node);
                                        }
                                        return true;
                                    }
                                });
                                _.find(widgetConfig.config.groups, function (e, _i) {
                                    if (e.id == id) {
                                        e.type = '=';
                                        e.values = [value];
                                        if (!_.find(widgetConfig.config.groups, function (e) {
                                                return e.id == node.id;
                                            })) {
                                            widgetConfig.config.groups.splice(_i + 1, 0, node);
                                        }
                                        return true;
                                    }
                                });
                                dataService.getDataSeries({
                                    datasource: widgetConfig.datasource,
                                    query: widgetConfig.query,
                                    datasetId: widgetConfig.datasetId,
                                    chartConfig: widgetConfig.config
                                }).then(function (data) {
                                    var option = chartServiceInstance.parseOption(data);
                                    if (optionFilter) {
                                        optionFilter(option);
                                    }
                                    render(option, data.drill.config);
                                });
                            });
                        };
                        data.drill.drillUp = function (id, render) {
                            _.find(widgetConfig.config.keys, function (e, _i) {
                                if (e.id == id) {
                                    widgetConfig.config.keys[_i - 1].values = [];
                                    widgetConfig.config.keys.splice(_i, 1);
                                    return true;
                                }
                            });
                            _.find(widgetConfig.config.groups, function (e, _i) {
                                if (e.id == id) {
                                    widgetConfig.config.groups[_i - 1].values = [];
                                    widgetConfig.config.groups.splice(_i, 1);
                                    return true;
                                }
                            });
                            dataService.getDataSeries({
                                datasource: widgetConfig.datasource,
                                query: widgetConfig.query,
                                datasetId: widgetConfig.datasetId,
                                chartConfig: widgetConfig.config
                            }).then(function (data) {
                                var option = chartServiceInstance.parseOption(data);
                                if (optionFilter) {
                                    optionFilter(option);
                                }
                                render(option, data.drill.config);
                            });
                        };
                    }
                } finally {
                    if (widgetConfig.config.chart_type == 'chinaMapBmap') {
                        chartServiceInstance.render(containerDom, option, scope, persist, data.drill);
                    } else {
                        deferred.resolve(chartServiceInstance.render(containerDom, option, scope, persist, data.drill, relations, widgetConfig.config));
                    }
                }
            });
            return deferred.promise;
        };

        this.realTimeRender = function (realTimeTicket, widget, optionFilter, scope, widgetWraper, isParamEvent) {
            if (!realTimeTicket) {
                return;
            }
            var chart = getChartServices(widget.config);

            if (isParamEvent && widgetWraper) {
                widgetWraper.loading = true;
            }
            dataService.getDataSeries({
                datasource: widget.datasource,
                query: widget.query,
                datasetId: widget.datasetId,
                chartConfig: widget.config,
                reload: isParamEvent ? false : true
            }).then(function (data) {
                var option = chart.parseOption(data);
                if (optionFilter) {
                    optionFilter(option);
                }
                realTimeTicket(option, data.drill ? data.drill.config : null);
                if (widgetWraper) {
                    widgetWraper.loading = false;
                }
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
                case 'gauge':
                    chart = chartGaugeService;
                    break;
                case 'wordCloud':
                    chart = chartWordCloudService;
                    break;
                case 'treeMap':
                    chart = chartTreeMapService;
                    break;
                case 'areaMap':
                    chart = chartAreaMapService;
                    break;
                case 'heatMapCalendar':
                    chart = chartHeatMapCalendarService;
                    break;
                case 'heatMapTable':
                    chart = chartHeatMapTableService;
                    break;
                case 'liquidFill':
                    chart = chartLiquidFillService;
                    break;
                case 'contrast':
                    chart = chartContrastService;
                    break;
                case 'chinaMap':
                    chart = chartChinaMapService;
                    break;
                case 'chinaMapBmap':
                    chart = chartChinaMapBmapService;
                    break;
                case 'relation':
                    chart = chartRelationService;
                    break;
            }
            return chart;
        };
    }
);
