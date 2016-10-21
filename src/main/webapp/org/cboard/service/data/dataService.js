/**
 * Created by yfyuan on 2016/8/12.
 */
cBoard.service('dataService', function ($http, updateService) {

    /**
     * Get raw data from server side.
     * @param datasource
     * @param query
     * @param callback
     */
    this.getData = function (datasource, query, datasetId, callback) {
        $http.post("/dashboard/getData.do", {
            datasourceId: datasource,
            query: angular.toJson(query),
            datasetId: datasetId
        }).success(function (response) {
            callback(response);
        });
    };

    this.parseKpiOption = function (chartData, config) {
        var option = {};
        castRawData2Series(chartData, config, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            option.kpiValue = aggregate_data[0][0];
            if (config.values[0].format) {
                option.kpiValue = numbro(option.kpiValue).format(config.values[0].format);
            }
            option.kpiName = config.values[0].name;
            option.style = config.values[0].style;

        });
        return option;
    };

    this.parseEchartOption = function (chartData, config) {
        switch (config.chart_type) {
            case 'line':
                return parseEchartOptionLine(chartData, config);
            case 'pie':
                return parseEchartOptionPie(chartData, config);
            default:
                return null;
        }
    };

    var parseEchartOptionLine = function (chartData, chartConfig) {
        var echartOption = null;
        castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            var series_data = new Array();
            var string_keys = _.map(casted_keys, function (key) {
                return key.join('-');
            });

            for (var i = 0; i < aggregate_data.length; i++) {
                var s = angular.copy(newValuesConfig[casted_values[i]]);
                s.name = casted_values[i];
                s.data = aggregate_data[i];
                if (s.type == 'stackbar') {
                    s.type = 'bar';
                    s.stack = s.yAxisIndex.toString();
                }
                series_data.push(s);
            }

            var yAxis = angular.copy(chartConfig.values);
            _.each(yAxis, function (e, i) {
                e.axisLabel = {
                    formatter: function (value) {
                        return numbro(value).format("0a.[0000]");
                    }
                };
                if (i > 0) {
                    e.splitLine = false;
                }
                e.scale = true;
            });
            echartOption = {
                legend: {
                    data: casted_values
                },
                xAxis: {
                    type: 'category',
                    data: string_keys
                },
                yAxis: yAxis,
                series: series_data
            };
        });
        return echartOption;
    };

    var parseEchartOptionPie = function (chartData, chartConfig) {
        var echartOption = null;
        castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            var series_data = new Array();
            var string_keys = _.map(casted_keys, function (key) {
                return key.join('-');
            });

            for (var i = 0; i < aggregate_data[0].length; i++) {
                series_data.push({name: string_keys[i], value: aggregate_data[0][i]});
            }
            echartOption = {
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: string_keys
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                toolbox: false,
                series: [
                    {
                        name: chartConfig.values[0].name,
                        type: 'pie',
                        data: series_data,
                        roseType: 'angle'
                    }
                ]
            };
        });
        return echartOption;
    };

    this.parseTableOption = function (chartData, chartConfig) {
        var tableOption = null;
        castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            var keysList = casted_keys,
                values_double_list = [],
                keyArr = [],
                emptyList = [],
                keyLength = chartConfig.keys.length;
            Array.matrix = function(numrows, numcols, initial) {
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
            for(var h = 0;h < keysList[0].length;h++){
                for(var k = 0; k < keysList.length; k++) {
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
            var merge_header = Array.matrix(chartConfig.groups.length+1, casted_values.length, 0),
                column_header = Array.matrix(chartConfig.groups.length+1, casted_values.length, 0);
            _.each(casted_values, function(d) {
                var valuesList = d.split("-");
                values_double_list.push(valuesList);
            });
            for(var n = 0;n < values_double_list.length;n++){
                for(var m = 0;m < values_double_list[n].length;m++){
                    column_header[m][n] = values_double_list[n][m];
                }
            }
            for (var y = 0; y < keyLength; y++) {
                keyArr.push(chartConfig.keys[y].col);
                emptyList.push(null);
            }
            for(var j = 0;j < column_header.length;j++){
                j == column_header.length-1 ?
                    column_header[j] = keyArr.concat(column_header[j]) : column_header[j] = emptyList.concat(column_header[j]);
            }
            for(var x = 0; x < column_header.length-1; x++){
                for(var y = emptyList.length; y < column_header[x].length; y++){
                    var header_node = column_header[x][y];
                    y > emptyList.length ? (header_node == column_header[x][y-1] ? merge_header[x][y] = '' : merge_header[x][y] = column_header[x][y]) : merge_header[x][y] = column_header[x][y];
                }
                for(var z = 0; z < emptyList.length; z++){
                    merge_header[x][z] = null;
                }
            }
            merge_header[column_header.length-1] = column_header[column_header.length-1];
            table_data = merge_header.concat(table_data);
            tableOption = {
                chartConfig: chartConfig,
                data: table_data
            };
        });
        return tableOption;
    };

    var getDataSeries = function (rawData, chartConfig) {
        var result = [];
        _.each(chartConfig.values, function (v) {
            _.each(v.cols, function (c) {
                var series = configToDataSeries(rawData, c);
                _.each(series, function (s) {
                    if (!_.find(result, function (e) {
                            return JSON.stringify(e) == JSON.stringify(s);
                        })) {
                        result.push(s);
                    }
                });
            });
        });
        return result;
    };

    var configToDataSeries = function (rawData, config) {
        switch (config.type) {
            case 'exp':
                return getExpSeries(rawData, config.exp);
                break;
            default:
                return [{
                    name: config.col,
                    aggregate: config.aggregate_type,
                    index: getHeaderIndex(rawData, [config.col])[0]
                }]
                break;
        }
    };

    var getExpSeries = function (rawData, exp) {
        var result = [];
        exp = exp.trim();
        _.each(exp.match(/(sum|avg|count|max|min)\([\u4e00-\u9fa5_a-zA-Z0-9]+\)/g), function (text) {
            var name = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
            result.push({
                name: name,
                aggregate: text.substring(0, text.indexOf('(')),
                index: getHeaderIndex(rawData, [name])[0]
            });
        });
        return result;
    };

    var getRule = function (cfg, colIdx) {
        switch (cfg.type) {
            case 'eq':
                return function (row) {
                    for (var i = 0; i < cfg.values.length; i++) {
                        if (row[colIdx] == cfg.values[i]) {
                            return true;
                        }
                    }
                    return cfg.values.length == 0;
                };
                break;
            case 'ne':
                return function (row) {
                    for (var i = 0; i < cfg.values.length; i++) {
                        if (row[colIdx] == cfg.values[i]) {
                            return false;
                        }
                    }
                    return true;
                };
                break;
        }
    };


    var getFilter = function (chartConfig, keysIdx, groupsIdx, filtersIdx) {
        var rules = [];
        _.map(keysIdx, function (v, i) {
            var cfg = chartConfig.keys[i];
            rules.push(getRule(cfg, v));
        });
        _.map(groupsIdx, function (v, i) {
            var cfg = chartConfig.groups[i];
            rules.push(getRule(cfg, v));
        });
        _.map(filtersIdx, function (v, i) {
            var cfg = chartConfig.filters[i];
            rules.push(getRule(cfg, v));
        });
        return function (row) {
            for (var i = 0; i < rules.length; i++) {
                if (!rules[i](row)) {
                    return false;
                }
            }
            return true;
        };
    };

    /**
     * Cast the aggregated raw data into data series
     * @param rawData
     * @param chartConfig
     * @param callback function which is used to transform series data to widgets option
     */
    var castRawData2Series = function (rawData, chartConfig, callback) {
        updateService.updateConfig(chartConfig);
        var keysIdx = getHeaderIndex(rawData, _.map(chartConfig.keys, function (e) {
            return e.col;
        }));
        var keysSort = _.map(chartConfig.keys, function (e) {
            return e.sort;
        });
        var groupsIdx = getHeaderIndex(rawData, _.map(chartConfig.groups, function (e) {
            return e.col;
        }));
        var groupsSort = _.map(chartConfig.groups, function (e) {
            return e.sort;
        });
        var filtersIdx = getHeaderIndex(rawData, _.map(chartConfig.filters, function (e) {
            return e.col;
        }));
        var dataSeries = getDataSeries(rawData, chartConfig);

        var castedKeys = new Array();
        var castedGroups = new Array();
        var newData = {};

        var filter = getFilter(chartConfig, keysIdx, groupsIdx, filtersIdx);

        for (var i = 1; i < rawData.length; i++) {
            if (!filter(rawData[i])) {
                continue;
            }
            //组合keys
            var newKey = getRowElements(rawData[i], keysIdx);
            var keysInsert = sortInsert(castedKeys, newKey, keysSort);
            if (keysInsert.newKey) {
                _.mapObject(newData, function (g) {
                    _.mapObject(g, function (groupSeries) {
                        _.each(_.keys(groupSeries), function (aggregateType) {
                            groupSeries[aggregateType].splice(keysInsert.idx, 0, undefined)
                        });
                    });
                });
            }
            //组合groups
            var group = getRowElements(rawData[i], groupsIdx);
            sortInsert(castedGroups, group, groupsSort);
            var newGroup = group.join('-');
            // pick the raw values into coordinate cell and then use aggregate function to do calculate
            _.each(dataSeries, function (dSeries) {
                if (_.isUndefined(newData[newGroup])) {
                    newData[newGroup] = {};
                }
                if (_.isUndefined(newData[newGroup][dSeries.name])) {
                    newData[newGroup][dSeries.name] = {};
                }
                if (_.isUndefined(newData[newGroup][dSeries.name][dSeries.aggregate])) {
                    newData[newGroup][dSeries.name][dSeries.aggregate] = [];
                }
                if (_.isUndefined(newData[newGroup][dSeries.name][dSeries.aggregate][keysInsert.idx])) {
                    newData[newGroup][dSeries.name][dSeries.aggregate][keysInsert.idx] = [];
                }
                newData[newGroup][dSeries.name][dSeries.aggregate][keysInsert.idx].push(rawData[i][dSeries.index]);
            });
        }
        // do aggregate
        _.mapObject(newData, function (g) {
            _.mapObject(g, function (groupSeries) {
                _.each(_.keys(groupSeries), function (aggregateType) {
                    for (var i = 0; i < groupSeries[aggregateType].length; i++) {
                        if (groupSeries[aggregateType][i]) {
                            groupSeries[aggregateType][i] = aggregate(groupSeries[aggregateType][i], aggregateType);
                        }
                    }
                });
            });
        });
        var castedAliasSeriesName = new Array();
        var aliasSeriesConfig = {};
        var aliasData = new Array();
        _.each(castedGroups, function (group) {
            _.each(chartConfig.values, function (value, vIdx) {
                _.each(value.cols, function (series) {
                    var seriesName = series.alias ? series.alias : series.col;
                    var newSeriesName = seriesName;
                    if (group && group.length > 0) {
                        var a = [].concat(group);
                        a.push(seriesName);
                        newSeriesName = a.join('-');
                    }
                    castedAliasSeriesName.push(newSeriesName);
                    aliasSeriesConfig[newSeriesName] = {type: value.series_type, yAxisIndex: vIdx};

                    castSeriesData(series, group.join('-'), castedKeys, newData, function (castedData, keyIdx) {
                        if (!aliasData[castedAliasSeriesName.length - 1]) {
                            aliasData[castedAliasSeriesName.length - 1] = new Array();
                        }
                        // Only format decimal
                        aliasData[castedAliasSeriesName.length - 1][keyIdx] = dataFormat(castedData);
                    });
                });
            });
        });
        callback(castedKeys, castedAliasSeriesName, aliasData, aliasSeriesConfig);
    };

    var castSeriesData = function (series, group, castedKeys, newData, iterator) {
        switch (series.type) {
            case 'exp':
                var runExp = compileExp(series.exp);
                for (var i = 0; i < castedKeys.length; i++) {
                    iterator(runExp(newData[group], i), i);
                }
                break;
            default:
                _.each(newData[group][series.col][series.aggregate_type], iterator);
                break;
        }
    };

    var compileExp = function (exp) {
        exp = exp.trim();
        _.each(exp.match(/(sum|avg|count|max|min)\([\u4e00-\u9fa5_a-zA-Z0-9]+\)/g), function (text) {
            var name = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
            var aggregate = text.substring(0, text.indexOf('('));
            exp = exp.replace(text, "groupData['" + name + "']['" + aggregate + "'][keyIdx]");
        });
        return function (groupData, keyIdx) {
            return eval(exp);
        };
    };

    var aggregate = function (data_array, fnc) {
        if (!data_array) {
            return data_array;
        }
        switch (fnc) {
            case 'sum':
                return aggregate_sum(data_array);
            case 'count':
                return aggregate_count(data_array);
            case 'avg':
                return aggregate_avg(data_array);
            case 'max':
                return _.max(data_array, function (f) {
                    return parseFloat(f);
                });
            case 'min':
                return _.min(data_array, function (f) {
                    return parseFloat(f);
                });
        }
    };

    var aggregate_sum = function (data_array) {
        var sum = 0;
        for (var i = 0; i < data_array.length; i++) {
            var f = parseFloat(data_array[i]);
            if (f) {
                sum += f;
            }
        }
        return sum;
    };

    var aggregate_count = function (data_array) {
        return data_array.length;
    };

    var aggregate_avg = function (data_array) {
        var sum = 0;
        var count = 0;
        for (var i = 0; i < data_array.length; i++) {
            var f = parseFloat(data_array[i]);
            if (f) {
                sum += f;
                count++;
            }
        }
        return count == 0 ? 0 : sum / count;
    };

    var getHeaderIndex = function (chartData, col) {
        var result = new Array();
        if (col) {
            for (var j = 0; j < col.length; j++) {
                var idx = _.indexOf(chartData[0], col[j]);
                result.push(idx);
            }
        }
        return result;
    };

    var getRowElements = function (row, elmIdxs) {
        var arr = new Array();
        for (var j = 0; j < elmIdxs.length; j++) {
            var elm = row[elmIdxs[j]];
            arr.push(elm);
        }
        return arr;
    };

    var sortInsert = function (arr, elm, sort) {
        var idx = indexOf(arr, elm);
        if (idx < 0) {
            for (var i = 0; i < arr.length; i++) {
                for (var j = 0; j < arr[i].length; j++) {
                    if (!sort[j] || elm[j] == arr[i][j]) {
                        continue;
                    }
                    var a = Number(elm[j]);
                    var b = Number(arr[i][j]);
                    if (Number.isNaN(a) || Number.isNaN(b)) {
                        a = elm[j];
                        b = arr[i][j];
                    }
                    if ((a > b) ^ (sort[j] != 'asc')) {
                        break;
                    } else {
                        arr.splice(i, 0, elm);
                        return {idx: i, newKey: true};
                    }
                }
            }
            var x = arr.length;
            arr.push(elm);
            return {idx: x, newKey: true};
        } else {
            return {idx: idx, newKey: false};
        }
    };

    var indexOf = function (array, key) {
        var idx = -1;
        outer : for (var i = 0; i < array.length; i++) {
            // if (array[i].length != key.length) {
            //     continue outer;
            // }
            for (var j = 0; j < array[i].length; j++) {
                if (array[i][j] != key[j]) {
                    continue outer;
                }
            }
            idx = i;
            break;
        }
        return idx;
    };
});
