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
                    table_data[k][h] = {
                        property: 'header_key',
                        data: keysList[k][h]
                    };
                }
            }
            for (var i = 0; i < casted_values.length; i++) {
                for (var j = 0; j < casted_keys.length; j++) {
                    if (!_.isUndefined(aggregate_data[i][j])) {
                        table_data[j][i + keyLength] = {
                            property: 'data',
                            data: aggregate_data[i][j]
                        };
                    } else {
                        table_data[j][i + keyLength] = {
                            property: 'data',
                            data: ''
                        };
                    }
                }
            }
            var column_header = Array.matrix(chartConfig.groups.length + 1, casted_values.length, 0);
            for (var n = 0; n < casted_values.length; n++) {
                for (var m = 0; m < casted_values[n].length; m++) {
                    column_header[m][n] = {
                        property: 'header_key',
                        data: casted_values[n][m]
                    };
                }
            }
            for (var y = 0; y < keyLength; y++) {
                keyArr.push({
                    property: 'header_key',
                    data: chartConfig.keys[y].col
                });
                emptyList.push({
                    property: 'header_empty',
                    data: null
                });
            }
            for (var j = 0; j < column_header.length; j++) {
                j == column_header.length - 1 ?
                    column_header[j] = keyArr. concat(column_header[j]) :
                    column_header[j] = emptyList.concat(column_header[j]);
            }
            tableOption = {
                chartConfig: chartConfig,
                data: column_header.concat(table_data)
            };
        });
        return tableOption;
    };
});