/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartService', function($q, dataService, chartPieService, chartLineService, chartFunnelService,
  chartSankeyService, chartTableService, chartKpiService, chartRadarService,
  chartMapService, chartScatterService, chartGaugeService, chartWordCloudService,
  chartTreeMapService, chartAreaMapService, chartHeatMapCalendarService, chartHeatMapTableService,
  chartLiquidFillService, chartContrastService, chartChinaMapService, chartChinaMapBmapService,
  chartRelationService, chartWorldMapService) {

  this.render = function(containerDom, widget, optionFilter, scope, reload, persist, relations, isCockpit) {
      if (isCockpit) {
          CBoardEChartRender.prototype.theme = "dark";
      } else {
          CBoardEChartRender.prototype.theme = "theme-fin1"
      }
    var deferred = $q.defer();
    var chart = getChartServices(widget.config);
    dataService.getDataSeries(widget.datasource, widget.query, widget.datasetId, widget.config, function(data) {
      try {
        var option = chart.parseOption(data);
        if (optionFilter) {
          optionFilter(option);
        }
        if (data.drill) {
          data.drill.drillDown = function(id, value, render) {
            dataService.getDrillPath(widget.datasetId, id).then(function(path) {
              var i = 0;
              _.each(path, function(e, _i) {
                if (e.id == id) {
                  i = _i;
                }
              });
              var node = path[++i];
              _.find(widget.config.keys, function(e, _i) {
                if (e.id == id) {
                  e.type = '=';
                  e.values = [value];
                  if (!_.find(widget.config.keys, function(e) {
                      return e.id == node.id;
                    })) {
                    widget.config.keys.splice(_i + 1, 0, node);
                  }
                  return true;
                }
              });
              _.find(widget.config.groups, function(e, _i) {
                if (e.id == id) {
                  e.type = '=';
                  e.values = [value];
                  if (!_.find(widget.config.groups, function(e) {
                      return e.id == node.id;
                    })) {
                    widget.config.groups.splice(_i + 1, 0, node);
                  }
                  return true;
                }
              });
              dataService.getDataSeries(widget.datasource, widget.query, widget.datasetId, widget.config, function(data) {
                var option = chart.parseOption(data);
                if (optionFilter) {
                  optionFilter(option);
                }
                render(option, data.drill.config);
              });
            });
          };
          data.drill.drillUp = function(id, render) {
            _.find(widget.config.keys, function(e, _i) {
              if (e.id == id) {
                widget.config.keys[_i - 1].values = [];
                widget.config.keys.splice(_i, 1);
                return true;
              }
            });
            _.find(widget.config.groups, function(e, _i) {
              if (e.id == id) {
                widget.config.groups[_i - 1].values = [];
                widget.config.groups.splice(_i, 1);
                return true;
              }
            });
            dataService.getDataSeries(widget.datasource, widget.query, widget.datasetId, widget.config, function(data) {
              var option = chart.parseOption(data);
              if (optionFilter) {
                optionFilter(option);
              }
              render(option, data.drill.config);
            });
          };
        }
      } finally {
        if (widget.config.chart_type == 'chinaMapBmap') {
          chart.render(containerDom, option, scope, persist, data.drill);
        } else {
          deferred.resolve(chart.render(containerDom, option, scope, persist, data.drill, relations, widget.config));
        }
      }
    }, reload);
    return deferred.promise;
  };

  this.realTimeRender = function(realTimeTicket, widget, optionFilter, scope, widgetWraper, isParamEvent) {
    if (!realTimeTicket) {
      return;
    }
    var chart = getChartServices(widget.config);

    if (isParamEvent && widgetWraper) {
      widgetWraper.loading = true;
    }

    var callback = function(data) {
      var option = chart.parseOption(data);
      if (optionFilter) {
        optionFilter(option);
      }
      realTimeTicket(option, data.drill ? data.drill.config : null);
      if (widgetWraper) {
        widgetWraper.loading = false;
      }
    };
    dataService.getDataSeries(widget.datasource, widget.query, widget.datasetId, widget.config, callback, true);
  };

  var getChartServices = function(chartConfig) {
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
      case 'worldMap':
        chart = chartWorldMapService;
        break;
    }
    return chart;
  };

});