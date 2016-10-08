var CBoardTableRender = function (jqContainer, options) {
    this.container = jqContainer; // jquery object
    this.options = options;
};

CBoardTableRender.prototype.do = function (height) {
    var _this = this;
    var id = randomStr();
    $(_this.container).html(_this.template.render({id: id}));
    $('#' + id).DataTable({
        data: _this.options.data,
        columns: _this.options.columns,
        scrollX: true,
        scrollY: height - 150,
        scrollCollapse: true,
        paging: true
    });
};

CBoardTableRender.prototype.template = "<table id='{id}' class='table table-bordered table-striped'></table>";
