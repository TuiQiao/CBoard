/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartTableService', function (dataService) {

    this.render = function (containerDom, option, scope) {
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardTableRender(containerDom, option).do(height);
    };

    this.parseOption = function (chartData, chartConfig) {
        var tableOption = null;
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            var keysList = casted_keys,
                values_double_list = [],
                keyArr = [],
                emptyList = [],
                keyLength = chartConfig.keys.length;
            Array.matrix = function (numrows, numcols, initial) {
                var arr = [];
                for (var a = 0; a < numrows; ++a) {
                    var columns = [];
                    for (var s = 0; s < numcols; ++s) {
                        columns[s] = initial;
                    }
                    arr[a] = columns;
                }
                return arr;
            };
            var table_data = Array.matrix(keysList.length, keysList[0].length, 0);
            for (var h = 0; h < keysList[0].length; h++) {
                for (var k = 0; k < keysList.length; k++) {
                    var node = keysList[k][h];
                    k > 0 ? (node == keysList[k - 1][h] ? table_data[k][h] = null : table_data[k][h] = keysList[k][h]) : table_data[k][h] = keysList[k][h];
                }
            }
            for (var i = 0; i < casted_values.length; i++) {
                for (var j = 0; j < casted_keys.length; j++) {
                    if (!_.isUndefined(aggregate_data[i][j])) {
                        table_data[j][i + keyLength] = aggregate_data[i][j];
                    } else {
                        table_data[j][i + keyLength] = 'N/A';
                    }
                }
            }
            var handle_header = Array.matrix(chartConfig.groups.length + 1, casted_values.length, 0),
                column_header = Array.matrix(chartConfig.groups.length + 1, casted_values.length, 0);
            _.each(casted_values, function (d) {
                var valuesList = d;
                values_double_list.push(valuesList);
            });
            for (var n = 0; n < values_double_list.length; n++) {
                for (var m = 0; m < values_double_list[n].length; m++) {
                    column_header[m][n] = values_double_list[n][m];
                }
            }
            for (var y = 0; y < keyLength; y++) {
                keyArr.push(chartConfig.keys[y].col);
                emptyList.push(null);
            }
            for (var j = 0; j < column_header.length; j++) {
                j == column_header.length - 1 ?
                    column_header[j] = keyArr. concat(column_header[j]) : column_header[j] = emptyList.concat(column_header[j]);
            }
            for (var x = 0; x < column_header.length - 1; x++) {
                for (var y = emptyList.length; y < column_header[x].length; y++) {
                    var header_node = column_header[x][y];
                    y > emptyList.length ? (header_node == column_header[x][y - 1] ? handle_header[x][y] = '' : handle_header[x][y] = column_header[x][y]) : handle_header[x][y] = column_header[x][y];
                }
                for (var z = 0; z < emptyList.length; z++) {
                    handle_header[x][z] = null;
                }
            }
            handle_header[column_header.length - 1] = column_header[column_header.length - 1];
            tableOption = {
                chartConfig: chartConfig,
                handle_header: handle_header,
                column_header: column_header,
                data: table_data
            };
        });
        return tableOption;
    };
});