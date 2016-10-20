var CBoardTableRender = function (jqContainer, options) {
    this.container = jqContainer; // jquery object
    this.options = options;
};

CBoardTableRender.prototype.do = function (tall) {
    var html = "<table  class = 'table_wrapper'><thead>",
        chartConfig = this.options.chartConfig,
        data = this.options.data;
    for(var i = 0;i < chartConfig.groups.length+1;i++){
        var colContent = "<tr>";
        for(var j = 0;j < data[i].length;j++){
            var node = null;
            data[i][j] == null ?
                node = "<th class='all_null'><div></div></th>" :
                (data[i][j] == [] ? node = "<th class='col_null'><div></div></th>" : node = "<th class='row'><div>"+data[i][j]+"</div></th>");;
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
    tall ? null : tall = 600;
    $(this.container).html("<div style='width: 100%;height:" + tall + "px;overflow: auto'>" + html + "</div>");
    $(this.container).css({
        height: "600px"
    })
};
