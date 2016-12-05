/**
 * Created by Fine on 2016/12/4.
 */

var crossTable = {
    table: function(args){
        var data = args.data,
            chartConfig = args.chartConfig,
            tall = args.tall,
            container = args.container;
        var html = "<table  class = 'table_wrapper' id='tableWrapper'><thead>",
            colContent = "<tr>";
        for (var i = 0;i < chartConfig.groups.length;i++) {
            var colspan = 1;
            var colList = [];
            for (var t = 0; t < chartConfig.keys.length; t++) {
                colContent += "<th class=" + data[i][t].property + "><div></div></th>";
            }
            for (var y = chartConfig.keys.length ;y < data[i].length; y++) {
                if ((data[i][y + 1]) && (data[i][y].data == data[i][y + 1].data)) {
                    colspan++;
                }
                else {
                    colList.push({
                        data: data[i][y].data,
                        colSpan: colspan,
                        property: data[i][y].property
                    });
                    colspan = 1;
                }
            }
            for(var c = 0; c < colList.length; c++) {
                colContent += colList[c].colSpan > 1 ? "<th colspan=" + colList[c].colSpan +
                " class=" + colList[c].property + "><div>" + colList[c].data + "</div></th>" :
                "<th class=" + colList[c].property + "><div>" + colList[c].data + "</div></th>";
            }
            colContent += "</tr><tr>";
        }
        for (var k = 0; k < data[chartConfig.groups.length].length; k++) {
            colContent += "<th class=" + data[chartConfig.groups.length][k].property + "><div>" + data[chartConfig.groups.length][k].data + "</div></th>";
        }
        html += colContent + "</tr></thead><tbody>";
        for (var r = 0; r < chartConfig.keys.length; r++) {
            for(var  n = chartConfig.groups.length + 1; n < data.length; n++){
                var node = data[n][r].data;
                k > 0 ? (node == data[n - 1][r].data ? data[n][r] = {
                    data: data[n][r].data,
                    rowSpan: 'row_null',
                    property: data[n][r].property
                } : data[n][r] = {
                    data: data[n][r].data,
                    rowSpan: 'row',
                    property: data[n][r].property}) : null;
            }
        }
        for(var  n = chartConfig.groups.length + 1; n < data.length; n++){
            var rowContent = "<tr>";
            for (var m = 0; m < chartConfig.keys.length; m++){
                if (data[n][m].rowSpan == 'row_null') {
                    rowContent += "<th class=row_null><div></div></th>";
                } else {
                    rowContent += "<th class=row><div>"+data[n][m].data+"</div></th>";
                }
            }
            for(var y = chartConfig.keys.length; y < data[n].length; y++){
                rowContent += "<td class=" + data[n][m].property + "><div>"+data[n][y].data+"</div></td>";
            }
            html = html + rowContent + "</tr>";
        }
        html = html + "</tbody></table>";
        $(container).html("<div class='exportBnt'><button>export</button></div><div style='width: 100%;max-height:" + tall + "px;overflow: auto'>" + html + "</div>");
        this.export();
    },
    export: function() {
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
                    var fname = oXL.Application.GetSaveAsFilename("Excel .xls", "Excel Spreadsheets (* .xls), * .xls");
                } catch (e) {
                    print("Nested catch caught " + e);
                } finally {
                    oWB.SaveAs(fname);
                    oWB.Close(savechanges = true);
                    oXL.Quit();
                    oXL = null;
                    idTmr = window.setInterval("Cleanup();", 1);
                }
            } else {
                tableToExcel('tableWrapper');
            }
        });
    }
};