/**
 * Created by Fine on 2016/12/13.
 */
var CBoardGisRender = function (jqContainer, options, drill) {
    this.options = options;
    this.tall;
    this.jqContainer = jqContainer;
    this.drill = drill;
    var _this = this;
    $(jqContainer).html("<div class='gis_wrapper'></div>");
    $('.map_wrapper').resize(function () {
        _this.do(_this.tall);
    });
};

CBoardGisRender.prototype.do = function (tall, persist) {
    this.tall = tall;
    this.container = $('.gis_wrapper');
    tall = _.isUndefined(tall) ? 500 : tall;
    var render = function (o, drillConfig) {
        _this.options = o;
        _this.drill.config = drillConfig;
        _this.do(_this.tall);
    };
    var args = {
        height: tall,
        chartConfig: this.options.chartConfig,
        data: this.options.data,
        container: this.container,
        drill: this.drill,
        render: render
    };
    console.log(args);
    threeLevelMap.container = this.container;
    threeLevelMap.map(args);
    $(this.jqContainer).css({
        height: tall + 40 + "px",
        width: '100%'
    });
    $(this.container).css({
        height: tall + "px",
        width: '100%'
    });
    var _this = this;
    if (persist) {
        setTimeout(function () {
            html2canvas(_this.container[0], {
                onrendered: function (canvas) {
                    persist.data = canvas.toDataURL("image/jpeg");
                    persist.type = "jpg"
                }
            });
        }, 1000);
    }
    return function (o) {
        _this.options = o;
        _this.do(_this.tall);
    }
};