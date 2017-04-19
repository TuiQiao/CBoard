/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartKpiService', function (dataService, $compile, $filter) {

    var translate = $filter('translate');

    this.render = function (containerDom, option, scope, persist) {
        var render = new CBoardKpiRender(containerDom, option);
        var html = render.html(persist);
        if (scope) {
            containerDom.append($compile(html)(scope));
        } else {
            containerDom.html(html);
        }
        return render.realTimeTicket();
    };

    this.parseOption = function (data) {
        var option = {};
        var config = data.chartConfig;
        var casted_keys = data.keys;
        var casted_values = data.series;
        var aggregate_data = data.data;
        var newValuesConfig = data.seriesConfig;

        option.kpiValue = aggregate_data.length > 0 ? aggregate_data[0][0] : 'N/A';
        if (config.values[0].format) {
            option.kpiValue = numbro(option.kpiValue).format(config.values[0].format);
        }
        option.kpiName = config.values[0].name;
        option.style = config.values[0].style;
        option.edit = translate("COMMON.EDIT");
        option.refresh = translate("COMMON.REFRESH");
        return option;
    };
});