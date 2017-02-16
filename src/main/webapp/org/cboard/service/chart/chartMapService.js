/**
 * Created by Fine on 2016/12/13.
 */
cBoard.service('chartMapService', function (dataService) {
    this.render = function (containerDom, option, scope, persist) {
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardMapRender(containerDom, option).do(height, persist);
    };

    this.parseOption = function (chartData, chartConfig) {
        var mapOption = null;
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
            var map_data = Array.matrix(keysList.length, keysList[0].length, 0);
            for (var h = 0; h < keysList[0].length; h++) {
                for (var k = 0; k < keysList.length; k++) {
                    map_data[k][h] = {
                        property: 'row_key',
                        data: keysList[k][h]
                    };
                }
            }
            for (var i = 0; i < casted_values.length; i++) {
                for (var j = 0; j < casted_keys.length; j++) {
                    if (!_.isUndefined(aggregate_data[i][j])) {
                        map_data[j][i + keyLength] = {
                            property: 'data',
                            data: aggregate_data[i][j]
                        };
                    } else {
                        map_data[j][i + keyLength] = {
                            property: 'data',
                            data: 'N/A'
                        };
                    }
                }
            }
            var column_header = Array.matrix(chartConfig.groups.length + 1, casted_values.length, 0);
            for (var n = 0; n < casted_values.length; n++) {
                for (var m = 0; m < casted_values[n].length; m++) {
                    column_header[m][n] = {
                        property: 'column_key',
                        data: casted_values[n][m]
                    };
                }
            }
            for (var y = 0; y < keyLength; y++) {
                keyArr.push({
                    property: 'row_key',
                    data: chartConfig.keys[y].col
                });
                emptyList.push({
                    property: 'header_empty',
                    data: null
                });
            }
            for (var j = 0; j < column_header.length; j++) {
                j == column_header.length - 1 ?
                    column_header[j] = keyArr.concat(column_header[j]) :
                    column_header[j] = emptyList.concat(column_header[j]);
            }
            mapOption = {
                chartConfig: chartConfig,
                data: column_header.concat(map_data)
            };
            map_data = null;
            column_header = null;
        });
        return mapOption;
    };
});