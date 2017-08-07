/**
 * Created by jintian on 2017/8/7.
 */

var CboardBMapRender = function (jqContainer, options, isDeepSpec) {
    this.container = jqContainer; // jquery object
    var hotMap = jqContainer.get(0);
    $(hotMap).css("width","100%");
    $(hotMap).css("height","50%");
    this.ecc = echarts.init(jqContainer.get(0), this.theme);
    this.isDeppSpec = isDeepSpec;
    this.options = options;
};


CboardBMapRender.prototype.chart = function (group, persist) {
    var self = this;
    var options =  self.options;
    if (options.visualMap != undefined) {
        $(this.jqContainer).css({
            height: 500 + "px",
            width: '100%'
        });
    }
    self.ecc.setOption(options);
};

