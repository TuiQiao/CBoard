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

        var services = new Map();
        services.set('line', chartLineService);
        services.set('pie', chartPieService);
        services.set('kpi', chartKpiService);
        services.set('table', chartTableService);
        services.set('funnel', chartFunnelService);
        services.set('sankey', chartSankeyService);
        services.set('radar', chartRadarService);
        services.set('map', chartMapService);
        services.set('scatter', chartScatterService);
        services.set('gauge', chartGaugeService);
        services.set('wordCloud', chartWordCloudService);
        services.set('treeMap', chartTreeMapService);
        services.set('areaMap', chartAreaMapService);
        services.set('heatMapCalendar', chartHeatMapCalendarService);
        services.set('heatMapTable', chartHeatMapTableService);
        services.set('liquidFill', chartLiquidFillService);
        services.set('contrast', chartContrastService);
        services.set('chinaMap', chartChinaMapService);
        services.set('chinaMapBmap', chartChinaMapBmapService);
        services.set('relation', chartRelationService);

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
            return services.get(chartConfig.chart_type);
        };

    }
);
