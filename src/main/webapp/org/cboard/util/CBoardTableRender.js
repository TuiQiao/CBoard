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
    console.log(this.options);
    this.tall = tall;
    var html = "<table  class = 'table_wrapper' id='tableWrapper'><thead>",
        chartConfig = this.options.chartConfig,
        data = this.options.handle_header.concat(this.options.data);
    for(var i = 0;i < chartConfig.groups.length + 1;i++){
        var colContent = "<tr>";
        for(var j = 0;j < data[i].length;j++){
            var node = null;
            data[i][j] == null ?
                node = "<th class='all_null'><div></div></th>" :
                (data[i][j] == [] ? node = "<th class='col_null'><div></div></th>" : node = "<th class='row'><div>"+data[i][j]+"</div></th>");
            colContent = colContent + node;
        }
        html = html + colContent + "</tr>";
    }
    html = html + "</thead><tbody>";
    for(var  n = chartConfig.groups.length+1; n < data.length; n++){
        var rowContent = "<tr>";
        for(var m = 0; m < chartConfig.keys.length; m++){
            var node = null;
            data[n][m] == null ? node = "<th class='row_null'><div></div></th>" : node = "<th class='row'><div>"+data[n][m]+"</div></th>";
            rowContent = rowContent + node;
        }
        for(var y = chartConfig.keys.length; y < data[n].length; y++){
            rowContent = rowContent + "<td class='data'><div>"+data[n][y]+"</div></td>";
        }
        html = html + rowContent + "</tr>";
    }
    html = html + "</tbody></table>";
    tall = _.isUndefined(tall) ? 600 : tall;
    $(this.container).append("<div class='exportBnt'><button>export</button></div><div style='width: 100%;height:" + tall + "px;overflow: auto'>" + html + "</div>");
    $(this.container).css({
        height: tall + 40 + "px"
    });
    this.resize(this.container);
    this.export();
    var _this = this;
    return function (o) {
        _this.options = o;
        _this.do(_this.tall);
    }
};

CBoardTableRender.prototype.export = function() {
    var idTmr;
    function  getExplorer() {
        var explorer = window.navigator.userAgent ;
        if (explorer.indexOf("MSIE") >= 0) {
            return 'ie';
        }
        else if (explorer.indexOf("Firefox") >= 0) {
            return 'Firefox';
        }
        else if(explorer.indexOf("Chrome") >= 0){
            return 'Chrome';
        }
        else if(explorer.indexOf("Opera") >= 0){
            return 'Opera';
        }
        else if(explorer.indexOf("Safari") >= 0){
            return 'Safari';
        }
    };

    function Cleanup() {
        window.clearInterval(idTmr);
        CollectGarbage();
    };

    var tableToExcel = (function() {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html><head><meta charset="UTF-8"></head><body><table>{table}</table></body></html>',
            base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) },
            format = function(s, c) {
                return s.replace(/{(\w+)}/g,
                    function(m, p) { return c[p]; }) };
        return function(table, name) {
            if (!table.nodeType) table = document.getElementById(table);
            var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML};
            window.location.href = uri + base64(format(template, ctx))
        }
    })();

    $(".exportBnt").on('click', function(){
        if(getExplorer()=='ie') {
            var curTbl = document.getElementById('tableWrapper');
            var oXL = new ActiveXObject("Excel.Application");
            var oWB = oXL.Workbooks.Add();
            var xlsheet = oWB.Worksheets(1);
            var sel = document.body.createTextRange();
            sel.moveToElementText(curTbl);
            sel.select();
            sel.execCommand("Copy");
            xlsheet.Paste();
            oXL.Visible = true;
            try {
                var fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
            } catch (e) {
                print("Nested catch caught " + e);
            } finally {
                oWB.SaveAs(fname);
                oWB.Close(savechanges = false);
                oXL.Quit();
                oXL = null;
                idTmr = window.setInterval("Cleanup();", 1);
            }
        } else {
            tableToExcel('tableWrapper');
        }
    });
};
