var CBoardTableRender = function (jqContainer, options) {
    this.container = jqContainer; // jquery object
    this.options = options;
    this.tall;
    var _this = this;
    $(this.container).resize(function (e) {
        _this.resize(e.target);
    });
};

CBoardTableRender.prototype.resize = function (container) {
    var wrapper = $(container).find('.table_wrapper');
    wrapper.css('width', 'auto');
    if(wrapper.width() < $(container).width()){
        wrapper.css('width','100%');
    }
};

CBoardTableRender.prototype.do = function (tall) {
    this.tall = tall;
    tall = _.isUndefined(tall) ? 500 : tall;
    var divHeight = tall - 90;
    var args = {
        tall: divHeight,
        chartConfig: this.options.chartConfig,
        data: this.options.data,
        container: this.container
    };
    crossTable.table(args);
    $(this.container).css({
        height: tall + "px"
    });
    this.resize(this.container);
    var _this = this;
    return function (o) {
        _this.options = o;
        _this.do(_this.tall);
    }
};

