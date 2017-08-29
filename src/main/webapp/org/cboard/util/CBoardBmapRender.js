/**
 * Created by jintian on 2017/8/7.
 *
 */

var CBoardBMapRender = function (jqContainer, options, isDeepSpec) {
    this.container = jqContainer; // jquery object
    var bMap = jqContainer.get(0);
    $(bMap).css("width", "100%");
    $(bMap).css("height", "500px");
    this.ecc = echarts.init(jqContainer.get(0), this.theme);
    this.options = options;
};

CBoardBMapRender.prototype.chart = function (group, persist) {
    var self = this;
    var options = self.options;
    self.ecc.setOption(options, true);
};