var CBoardKpiRender = function (jqContainer, options) {
    this.container = jqContainer; // jquery object
    this.options = options;
};

CBoardKpiRender.prototype.html = function () {
    var self = this;
    var temp = "" + self.template;
    var html = temp.render(self.options);
    return html;
};

CBoardKpiRender.prototype.realTimeTicket = function () {
    var self = this;
    return function (o) {
        $(self.container).find('h3').html(o.kpiValue);
    }
};

CBoardKpiRender.prototype.do = function () {
    var self = this;
    $(self.container).html(self.rendered());
};

CBoardKpiRender.prototype.template =
    "<div class='small-box {style}'> \
               <div class='inner'> \
                   <h3>{kpiValue}</h3> \
                   <p>{kpiName}</p> \
               </div> \
               <div class='icon'> \
                   <i class='ion ion-stats-bars'></i> \
               </div> \
               <a class='small-box-footer'>\
                {{'COMMON.REFRESH'|translate}} <i class='fa fa-refresh' style='cursor: pointer' ng-click='reload(widget)'></i>\
                {{'COMMON.EDIT'|translate}} <i class='fa fa-wrench' style='cursor: pointer' ng-click='config(widget)'></i></a>\
            </div>";
