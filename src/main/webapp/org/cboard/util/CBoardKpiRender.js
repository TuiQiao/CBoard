var CBoardKpiRender = function (jqContainer, options) {
    this.container = jqContainer; // jquery object
    this.options = options;
};

CBoardKpiRender.prototype.rendered = function () {
    var self = this;
    var temp = "" + self.template;
    var html = temp.render(self.options);
    return html;
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
               <a class='small-box-footer' style='cursor: pointer' ng-click='config(widget)'>编辑 <i class='fa fa-wrench'></i></a>\
            </div>";
