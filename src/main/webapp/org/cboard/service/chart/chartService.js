/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartService', function (chartPieService, chartLineService, chartFunnelService, chartSankeyService, chartTableService, chartKpiService, chartRadarService) {

        this.render = function (containerDom, chartData, chartConfig, optionFilter, scope) {
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
            }
            var option = chart.parseOption(chartData, chartConfig);
            if (optionFilter) {
                optionFilter(option);
            }
            chart.render(containerDom, option, scope);
        };

    }
);