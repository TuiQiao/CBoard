/**
 * Created by Fine on 2016/12/13.
 */
var CBoardMapRender = function (jqContainer, options) {
    this.container = jqContainer; // jquery object
    this.options = options;
    this.tall;
    var _this = this;
    $(this.container).resize(function (e) {
        _this.resize(e.target);
    });
};

CBoardMapRender.prototype.resize = function (container) {
    var wrapper = $(container).find('.table_wrapper');
    wrapper.css('width', 'auto');
    if(wrapper.width() < $(container).width()){
        wrapper.css('width','100%');
    }
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
    this.resize(this.container);
    var _this = this;
    return function (o) {
        _this.options = o;
        _this.do(_this.tall);
    }
};