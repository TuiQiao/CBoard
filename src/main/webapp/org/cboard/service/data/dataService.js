/**
 * Created by yfyuan on 2016/8/12.
 */
'use strict';
cBoard.service('dataService', function ($http, updateService) {

    var getDimensionConfig = function (array) {
        if (array) {
            return _.map(array, function (e) {
                return {columnName: e.col, filterType: e.type, values: e.values}
            });
        } else {
            return [];
        }
    };

    this.getDimensionValues = function (datasource, query, datasetId, colmunName, chartConfig, callback) {
        var cfg = {rows: [], columns: [], filters: []};
        cfg.rows = getDimensionConfig(chartConfig.keys);
        cfg.columns = getDimensionConfig(chartConfig.groups);
        cfg.filters = getDimensionConfig(chartConfig.filters);

        $http.post("dashboard/getDimensionValues.do", {
            datasourceId: datasource,
            query: angular.toJson(query),
            datasetId: datasetId,
            colmunName: colmunName,
            cfg: angular.toJson(cfg),
        }).success(function (response) {
            callback(response[0], response[1]);
        });
    };

    this.getData = function (datasource, query, datasetId, chartConfig, callback, reload) {
        updateService.updateConfig(chartConfig);
        var dataSeries = getDataSeries(chartConfig);
        var cfg = {rows: [], columns: [], filters: []};
        cfg.rows = getDimensionConfig(chartConfig.keys);
        cfg.columns = getDimensionConfig(chartConfig.groups);
        cfg.filters = getDimensionConfig(chartConfig.filters);
        cfg.filters = cfg.filters.concat(getDimensionConfig(chartConfig.boardFilters));
        cfg.values = _.map(dataSeries, function (s) {
            return {column: s.name, aggType: s.aggregate};
        });
        $http.post("dashboard/getAggregateData.do", {
            datasourceId: datasource,
            query: angular.toJson(query),
            datasetId: datasetId,
            cfg: angular.toJson(cfg),
            reload: reload
        }).success(function (response) {
            callback(response);
        });
    };

    this.getColumns = function(option) {
        $http.post("dashboard/getColumns.do", {
            datasourceId: option.datasource,
            query: angular.toJson(option.query),
            datasetId: option.datasetId,
            reload: option.reload
        }).success(function (response) {
            option.callback(response);
        });
    };

    var getDataSeries = function (chartConfig) {
        var result = [];
        _.each(chartConfig.values, function (v) {
            _.each(v.cols, function (c) {
                var series = configToDataSeries(c);
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

    var configToDataSeries = function (config) {
        switch (config.type) {
            case 'exp':
                return getExpSeries(config.exp);
                break;
            default:
                return [{
                    name: config.col,
                    aggregate: config.aggregate_type
                }]
                break;
        }
    };

    var getExpSeries = function (exp) {
        var result = [];
        exp = exp.trim();
        _.each(exp.match(/(sum|avg|count|max|min)\([\u4e00-\u9fa5_a-zA-Z0-9]+\)/g), function (text) {
            var name = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
            result.push({
                name: name,
                aggregate: text.substring(0, text.indexOf('('))
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
    this.castRawData2Series = function (aggData, chartConfig, callback) {
        updateService.updateConfig(chartConfig);

        var castedKeys = new Array();
        var castedGroups = new Array();
        var joinedKeys = {};
        var joinedGroups = {};
        var newData = {};

        var getIndex = function (columnList, col) {
            var result = new Array();
            if (col) {
                for (var j = 0; j < col.length; j++) {
                    var idx = _.find(columnList, function (e) {
                        return e.name == col[j];
                    });
                    result.push(idx.index);
                }
            }
            return result;
        };

        var keysIdx = getIndex(aggData.columnList, _.map(chartConfig.keys, function (e) {
            return e.col;
        }));
        var keysSort = _.map(chartConfig.keys, function (e) {
            return e.sort;
        });
        var groupsIdx = getIndex(aggData.columnList, _.map(chartConfig.groups, function (e) {
            return e.col;
        }));
        var groupsSort = _.map(chartConfig.groups, function (e) {
            return e.sort;
        });

        var valueSeries = _.filter(aggData.columnList, function (e) {
            return e.aggType;
        });
        for (var i = 0; i < aggData.data.length; i++) {
            //组合keys
            var newKey = getRowElements(aggData.data[i], keysIdx);
            var jk = newKey.join('-');
            if (_.isUndefined(joinedKeys[jk])) {
                castedKeys.push(newKey);
                joinedKeys[jk] = true;
            }
            //组合groups
            var group = getRowElements(aggData.data[i], groupsIdx);
            var newGroup = group.join('-');
            if (_.isUndefined(joinedGroups[newGroup])) {
                castedGroups.push(group);
                joinedGroups[newGroup] = true;
            }
            // pick the raw values into coordinate cell and then use aggregate function to do calculate
            _.each(valueSeries, function (dSeries) {
                if (_.isUndefined(newData[newGroup])) {
                    newData[newGroup] = {};
                }
                if (_.isUndefined(newData[newGroup][dSeries.name])) {
                    newData[newGroup][dSeries.name] = {};
                }
                if (_.isUndefined(newData[newGroup][dSeries.name][dSeries.aggType])) {
                    newData[newGroup][dSeries.name][dSeries.aggType] = {};
                }
                if (_.isUndefined(newData[newGroup][dSeries.name][dSeries.aggType][jk])) {
                    newData[newGroup][dSeries.name][dSeries.aggType][jk] = [];
                }
                newData[newGroup][dSeries.name][dSeries.aggType][jk].push(parseFloat(aggData.data[i][dSeries.index]));
            });
        }
        //sort dimension
        var getSort = function (sort) {
            return function (a, b) {
                var r = 0;
                var j = 0;
                for (; j < a.length; j++) {
                    if (!sort[j]) {
                        continue;
                    }
                    if (a[j] == b[j]) {
                        r = 0;
                        continue;
                    }
                    var params = toNumber(a[j], b[j]);
                    r = (params[0] > params[1]) ? 1 : -1;
                    if (sort[j] == 'desc') r = r * -1;
                    break;
                }
                return r;
            }
        };
        castedKeys.sort(getSort(keysSort));
        castedGroups.sort(getSort(groupsSort));
        //
        var castedAliasSeriesName = new Array();
        var aliasSeriesConfig = {};
        var aliasData = new Array();
        _.each(castedGroups, function (group) {
            _.each(chartConfig.values, function (value, vIdx) {
                _.each(value.cols, function (series) {
                    var seriesName = series.alias ? series.alias : series.col;
                    var formatter = series.formatter;
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
                        aliasData[castedAliasSeriesName.length - 1][keyIdx] = dataFormat(castedData, formatter);
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
                    iterator(runExp(newData[group], castedKeys[i].join('-')), i);
                }
                break;
            default:
                for (var i = 0; i < castedKeys.length; i++) {
                    iterator(newData[group][series.col][series.aggregate_type][castedKeys[i].join('-')], i)
                }
                break;
        }
    };

    var compileExp = function (exp) {
        exp = exp.trim();
        _.each(exp.match(/(sum|avg|count|max|min)\([\u4e00-\u9fa5_a-zA-Z0-9]+\)/g), function (text) {
            var name = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
            var aggregate = text.substring(0, text.indexOf('('));
            exp = exp.replace(text, "groupData['" + name + "']['" + aggregate + "'][key]");
        });
        return function (groupData, key) {
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

});
