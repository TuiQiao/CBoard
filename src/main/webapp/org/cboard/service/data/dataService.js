/**
 * Created by yfyuan on 2016/8/12.
 */
'use strict';
cBoard.service('dataService', function ($http, updateService) {

    var getDimensionConfig = function (array) {
        var result = [];
        if (array) {
            _.each(array, function (e) {
                if (_.isUndefined(e.group)) {
                    result.push({columnName: e.col, filterType: e.type, values: e.values});
                } else {
                    _.each(e.filters, function (f) {
                        result.push({columnName: f.col, filterType: f.type, values: f.values});
                    });
                }
            });
        }
        return result;
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
        }).error(function (data) {
            callback(null);
        });
    };

    this.viewQuery = function (params, callback) {
        updateService.updateConfig(params.config);
        var dataSeries = getDataSeries(params.config);
        var cfg = {rows: [], columns: [], filters: []};
        cfg.rows = getDimensionConfig(params.config.keys);
        cfg.columns = getDimensionConfig(params.config.groups);
        cfg.filters = getDimensionConfig(params.config.filters);
        cfg.filters = cfg.filters.concat(getDimensionConfig(params.config.boardFilters));
        cfg.values = _.map(dataSeries, function (s) {
            return {column: s.name, aggType: s.aggregate};
        });
        $http.post("dashboard/viewAggDataQuery.do", {
            datasourceId: params.datasource,
            query: angular.toJson(params.query),
            datasetId: params.datasetId,
            cfg: angular.toJson(cfg),
        }).success(function (response) {
            callback(response[0]);
        });
    };

    this.getColumns = function (option) {
        $http.post("dashboard/getColumns.do", {
            datasourceId: option.datasource,
            query: option.query ? angular.toJson(option.query) : null,
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
        exp = exp.trim().replace(/[\n|\s]/g, '');
        var _temp = [];
        _.each(exp.match(/".*?"/g), function (text) {
            exp = exp.replace(text, '_#' + _temp.length);
            _temp.push(text);
        });
        _.each(exp.match(/(sum|avg|count|max|min)\("?.*?"?\)/g), function (text) {
            var name = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
            if (name.match("_#")) {
                name = _temp[name.replace("_#", "")].replace(/\"/g, "");
            }
            result.push({
                name: name,
                aggregate: text.substring(0, text.indexOf('('))
            });
        });
        return result;
    };

    var filter = function (cfg, iv) {
        switch (cfg.f_type) {
            case '=':
            case 'eq':
                for (var i = 0; i < cfg.f_values.length; i++) {
                    if (iv == cfg.f_values[i]) {
                        return true;
                    }
                }
                return cfg.f_values.length == 0;
            case '≠':
            case 'ne':
                for (var i = 0; i < cfg.f_values.length; i++) {
                    if (iv == cfg.f_values[i]) {
                        return false;
                    }
                }
                return true;
            case '>':
                var v = cfg.f_values[0];
                var params = toNumber(iv, v);
                if (!_.isUndefined(v) && params[0] <= params[1]) {
                    return false;
                }
                return true;
            case '<':
                var v = cfg.f_values[0];
                var params = toNumber(iv, v);
                if (!_.isUndefined(v) && params[0] >= params[1]) {
                    return false;
                }
                return true;
            case '≥':
                var v = cfg.f_values[0];
                var params = toNumber(iv, v);
                if (!_.isUndefined(v) && params[0] < params[1]) {
                    return false;
                }
                return true;
            case '≤':
                var v = cfg.f_values[0];
                var params = toNumber(iv, v);
                if (!_.isUndefined(v) && params[0] > params[1]) {
                    return false;
                }
                return true;
            case '(a,b]':
                var a = cfg.f_values[0];
                var b = cfg.f_values[1];
                var params = toNumber(iv, a, b);
                if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] <= params[1] || params[0] > params[2])) {
                    return false;
                }
                return true;
            case '[a,b)':
                var a = cfg.f_values[0];
                var b = cfg.f_values[1];
                var params = toNumber(iv, a, b);
                if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] < params[1] || params[0] >= params[2])) {
                    return false;
                }
                return true;
            case '(a,b)':
                var a = cfg.f_values[0];
                var b = cfg.f_values[1];
                var params = toNumber(iv, a, b);
                if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] <= params[1] || params[0] >= params[2])) {
                    return false;
                }
                return true;
            case '[a,b]':
                var a = cfg.f_values[0];
                var b = cfg.f_values[1];
                var params = toNumber(iv, a, b);
                if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] < params[1] || params[0] > params[2])) {
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    var toNumber = function () {
        var arr = _.isArray(arguments[0]) ? arguments[0] : arguments;
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            var a = Number(arr[i]);
            if (isNaN(a)) {
                return arr;
            } else {
                result.push(a);
            }
        }
        return result;
    };
    this.toNumber = toNumber;

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
                // if (_.isUndefined(newData[newGroup][dSeries.name][dSeries.aggType][jk])) {
                //     newData[newGroup][dSeries.name][dSeries.aggType][jk] = [];
                // }
                newData[newGroup][dSeries.name][dSeries.aggType][jk] = parseFloat(aggData.data[i][dSeries.index]);
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

        var valueSort = undefined;
        var valueSortArr = [];

        _.each(castedGroups, function (group) {
            _.each(chartConfig.values, function (value) {
                _.each(value.cols, function (series) {
                    if (_.isUndefined(valueSort) && series.sort) {
                        valueSort = series.sort;
                        castSeriesData(series, group.join('-'), castedKeys, newData, function (castedData, keyIdx) {
                            valueSortArr[keyIdx] = {v: castedData, i: keyIdx};
                        });
                    }
                });
            });
        });

        if (!_.isUndefined(valueSort)) {
            valueSortArr.sort(function (a, b) {
                if (a.v == b.v)return 0;
                var p = toNumber(a.v, b.v)
                if ((p[0] < p[1]) ^ valueSort == 'asc') {
                    return 1;
                }
                else {
                    return -1;
                }
            });
            var tk = angular.copy(castedKeys);
            _.each(valueSortArr, function (e, i) {
                castedKeys[i] = tk[e.i];
            });
        }

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
                    aliasSeriesConfig[newSeriesName] = {
                        type: value.series_type,
                        valueAxisIndex: vIdx,
                        formatter: series.formatter
                    };
                    castSeriesData(series, group.join('-'), castedKeys, newData, function (castedData, keyIdx) {
                        if (!aliasData[castedAliasSeriesName.length - 1]) {
                            aliasData[castedAliasSeriesName.length - 1] = new Array();
                        }
                        // Only format decimal
                        aliasData[castedAliasSeriesName.length - 1][keyIdx] = castedData;
                    });
                });
            });
        });
        for (var i = 0; i < castedKeys.length; i++) {
            var s = 0;
            var f = true;
            _.each(castedGroups, function (group) {
                _.each(chartConfig.values, function (value) {
                    _.each(value.cols, function (series) {
                        if (!f) {
                            return;
                        }
                        if (series.f_top && series.f_top <= i) {
                            f = false;
                        }
                        if (!filter(series, aliasData[s][i])) {
                            f = false;
                        }
                        if (f) {
                            aliasData[s][i] = dataFormat(aliasData[s][i]);
                        }
                        s++;
                    });
                });
            });
            if (!f) {
                castedKeys.splice(i, 1);
                _.each(aliasData, function (_series) {
                    _series.splice(i, 1);
                });
                i--;
            }
        }
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
        exp = exp.trim().replace(/[\n|\s]/g, '');
        var _temp = [];
        _.each(exp.match(/".*?"/g), function (text) {
            exp = exp.replace(text, '_#' + _temp.length);
            _temp.push(text);
        });
        var names = [];
        _.each(exp.match(/(sum|avg|count|max|min)\("?.*?"?\)/g), function (text) {
            var name = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
            if (name.match("_#")) {
                name = _temp[name.replace("_#", "")].replace(/\"/g, "");
                //name = name.replace(/\'/g, "\\'");
            }
            var aggregate = text.substring(0, text.indexOf('('));
            exp = exp.replace(text, "groupData[_names[" + names.length + "]]['" + aggregate + "'][key]");
            names.push(name);
        });
        return function (groupData, key) {
            var _names = names;
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
