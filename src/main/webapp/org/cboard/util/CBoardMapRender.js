/**
 * Created by Fine on 2016/12/13.
 */
var CBoardMapRender = function (jqContainer, options) {
    this.container = jqContainer; // jquery object
    this.options = options;
    this.tall;
    var _this = this;
    $(this.container).resize(function () {
        _this.do(_this.tall);
    });
};

CBoardMapRender.prototype.do = function (tall) {
    this.tall = tall;
    tall = _.isUndefined(tall) ? 520 : tall;
    var args = {
        height: tall,
        chartConfig: this.options.chartConfig,
        data: this.options.data,
        container: this.container
    };
    threeLevelMap.container = this.container;
    threeLevelMap.map(args);
    $(this.container).css({
        height: tall + 40 + "px"
    });
    var _this = this;
    return function (o) {
        _this.options = o;
        _this.do(_this.tall);
    }
};