/**
 * Created by zyong on 2016/7/25.
 */
var CBoardEChartRender = function (jqContainer, options, isDeepSpec) {
    this.container = jqContainer; // jquery object
    this.ecc = echarts.init(jqContainer.get(0), this.theme);
    this.isDeppSpec = isDeepSpec;

    this.basicOption = {
        title: {},
        grid: {
            left: '50',
            right: '25',
            bottom: '15%',
            top: '20%',
            containLabel: false
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            x: 'left',
            itemWidth: 15,
            itemHeight: 10,
        }
    };
    this.options = options;
}

CBoardEChartRender.prototype.theme = "theme-fin1"; // 主题

CBoardEChartRender.prototype.chart = function (group) {
    var self = this;
    var options = this.isDeppSpec == true ? self.options : $.extend(true, {}, self.basicOption, self.options);
    self.ecc.setOption(options);
    self.container.resize(function (e) {
        self.ecc.resize();
    }); // 图表大小自适应
    if(group){
        self.ecc.group = group;
        echarts.connect(group);
    }
}

//CBoardEChartRender.prototyp.