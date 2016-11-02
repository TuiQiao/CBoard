/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartKpiService', function (dataService, $compile) {

    this.render = function (containerDom, option, scope) {
        var render = new CBoardKpiRender(containerDom, option);
        var html = render.html();
        if (scope) {
            containerDom.append($compile(html)(scope));
        } else {
            containerDom.html(html);
        }
        return render.realTimeTicket();
    };

    this.parseOption = function (chartData, config) {
        var option = {};
        dataService.castRawData2Series(chartData, config, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            option.kpiValue = aggregate_data[0][0];
            if (config.values[0].format) {
                option.kpiValue = numbro(option.kpiValue).format(config.values[0].format);
            }
            option.kpiName = config.values[0].name;
            option.style = config.values[0].style;

        });
        return option;
    };
});