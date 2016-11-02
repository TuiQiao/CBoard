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
            right: '40',
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
    self.changeSize(self.ecc);
    self.container.resize(function (e) {
        self.ecc.resize();
        self.changeSize(self.ecc);
    }); // 图表大小自适应
    if (group) {
        self.ecc.group = group;
        echarts.connect(group);
    }
    return function (o) {
        self.ecc.setOption(o);
    }
};

CBoardEChartRender.prototype.changeSize = function (instance) {
    var o = instance.getOption();
    if (o.series[0].type == 'pie') {
        var l = o.series.length;
        var b = instance.getWidth() / (l + 1 + l * 8)
        for (var i = 0; i < l; i++) {
            if ((b * 8) < (instance.getHeight() * 0.75)) {
                o.series[i].radius = [0, b * 4];
            } else {
                o.series[i].radius = [0, '75%'];
            }
        }
        instance.setOption(o);
    }

};

//CBoardEChartRender.prototyp.