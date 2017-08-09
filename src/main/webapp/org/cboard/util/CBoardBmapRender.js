/**
 * Created by jintian on 2017/8/7.
 *
 * 百度地图专用处理
 */

var CboardBMapRender = function (jqContainer, options, isDeepSpec) {
    this.container = jqContainer; // jquery object
    var bMap = jqContainer.get(0);
    $(bMap).css("width","100%");
    $(bMap).css("height","500px");
    this.ecc = echarts.init(jqContainer.get(0), this.theme);
    this.options = options;
};


CboardBMapRender.prototype.chart = function (group, persist) {
    var self = this;
    var options = self.options;
    self.ecc.setOption(options,true);
};