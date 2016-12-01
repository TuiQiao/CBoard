/**
 * Created by yfyuan on 2016/8/12.
 */
'use strict';
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
            case '=':
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
            case '≠':
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
            case '>':
                return function (row) {
                    var v = cfg.values[0];
                    var params = toNumber(row[colIdx], v);
                    if (!_.isUndefined(v) && params[0] <= params[1]) {
                        return false;
                    }
                    return true;
                };
                break;
            case '<':
                return function (row) {
                    var v = cfg.values[0];
                    var params = toNumber(row[colIdx], v);
                    if (!_.isUndefined(v) && params[0] >= params[1]) {
                        return false;
                    }
                    return true;
                };
                break;
            case '≥':
                return function (row) {
                    var v = cfg.values[0];
                    var params = toNumber(row[colIdx], v);
                    if (!_.isUndefined(v) && params[0] < params[1]) {
                        return false;
                    }
                    return true;
                };
                break;
            case '≤':
                return function (row) {
                    var v = cfg.values[0];
                    var params = toNumber(row[colIdx], v);
                    if (!_.isUndefined(v) && params[0] > params[1]) {
                        return false;
                    }
                    return true;
                };
                break;
            case '(a,b]':
                return function (row) {
                    var a = cfg.values[0];
                    var b = cfg.values[1];
                    var params = toNumber(row[colIdx], a, b);
                    if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] <= params[1] || params[0] > params[2])) {
                        return false;
                    }
                    return true;
                };
                break;
            case '[a,b)':
                return function (row) {
                    var a = cfg.values[0];
                    var b = cfg.values[1];
                    var params = toNumber(row[colIdx], a, b);
                    if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] < params[1] || params[0] >= params[2])) {
                        return false;
                    }
                    return true;
                };
                break;
            case '(a,b)':
                return function (row) {
                    var a = cfg.values[0];
                    var b = cfg.values[1];
                    var params = toNumber(row[colIdx], a, b);
                    if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] <= params[1] || params[0] >= params[2])) {
                        return false;
                    }
                    return true;
                };
                break;
            case '[a,b]':
                return function (row) {
                    var a = cfg.values[0];
                    var b = cfg.values[1];
                    var params = toNumber(row[colIdx], a, b);
                    if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] < params[1] || params[0] > params[2])) {
                        return false;
                    }
                    return true;
                };
                break;
        }
    };
    this.getRule = getRule;


    var toNumber = function () {
        var arr = _.isArray(arguments[0]) ? arguments[0] : arguments;
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            var a = Number(arr[i]);
            if (Number.isNaN(a)) {
                return arr;
            } else {
                result.push(a);
            }
        }
        return result;
    };
    this.toNumber = toNumber;

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

    this.getFilterByConfig = function (chartData, chartConfig) {
        var keysIdx = getHeaderIndex(chartData, _.map(chartConfig.keys, function (e) {
            return e.col;
        }));
        var groupsIdx = getHeaderIndex(chartData, _.map(chartConfig.groups, function (e) {
            return e.col;
        }));
        var filtersIdx = getHeaderIndex(chartData, _.map(chartConfig.filters, function (e) {
            return e.col;
        }));
        return getFilter(chartConfig, keysIdx, groupsIdx, filtersIdx);
    };

    /**
     * Cast the aggregated raw data into data series
     * @param rawData
     * @param chartConfig
     * @param callback function which is used to transform series data to widgets option
     */
    this.castRawData2Series = function (rawData, chartConfig, callback) {
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
                        castedAliasSeriesName.push(a);
                    } else {
                        castedAliasSeriesName.push([seriesName]);
                    }
                    //castedAliasSeriesName.push(newSeriesName);
                    aliasSeriesConfig[newSeriesName] = {type: value.series_type, valueAxisIndex: vIdx};

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
                    var params = toNumber(elm[j], arr[i][j]);
                    if ((params[0] > params[1]) ^ (sort[j] != 'asc')) {
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
