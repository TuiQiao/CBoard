/**
 * Created by zyong on 2016/7/25.
 */

var echartsBasicOption = {
    title: {},
    grid: {
        left: '50',
        right: '20',
        bottom: '15%',
        top: '15%',
        containLabel: false
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        x: 'left',
        itemWidth: 15,
        itemHeight: 10
    }
};

var CBoardEChartRender = function (jqContainer, options, isDeepSpec) {
    this.container = jqContainer; // jquery object
    this.ecc = echarts.init(jqContainer.get(0), this.theme);
    this.isDeppSpec = isDeepSpec;

    this.basicOption = echartsBasicOption;
    this.options = options;
};

CBoardEChartRender.prototype.theme = "theme-fin1"; // 主题

CBoardEChartRender.prototype.chart = function (group, persist) {
    var self = this;
    var options = this.isDeppSpec == true ? self.options : $.extend(true, {}, self.basicOption, self.options);
    if (options.visualMap != undefined) {
        $(this.jqContainer).css({
            height: 500 + "px",
            width: '100%'
        });
    }
    if (options.legend.data && options.legend.data.length > 35) {
        options.grid.top = '5%';
        options.legend.show =false;
    }
    if(persist){
        options.animation = false;
    }
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
    if (persist) {
        setTimeout(function () {
            self.container.css('background', '#fff');
            html2canvas(self.container[0], {
                onrendered: function (canvas) {
                    persist.data = canvas.toDataURL("image/jpeg");
                    persist.type = "jpg"
                }
            });
        }, 1000);
    }
    return function (o) {
        o = $.extend(true, {}, self.basicOption, o)
        self.ecc.setOption(o, true);
    }
};

CBoardEChartRender.prototype.changeSize = function (instance) {
    var o = instance.getOption();
    var seriesType = o.series[0] ? o.series[0].type : null;
    if (seriesType == 'pie') {
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