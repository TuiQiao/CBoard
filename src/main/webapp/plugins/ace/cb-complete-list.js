/**
 * Created by zyong on 2017/4/13.
 */
var cbAcebaseOption = {
    require: ['ace/ext/language_tools'],
    mode: 'sql',
    useWrapMode: false,
    newLineMode: 'unix',
    showInvisibles: true,
    advanced: {
        autoScrollEditorIntoView: true,
        //enableSnippets: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
    },
    rendererOptions: {
        fontSize: '14px',
        minLines: 10,
        maxLines: 100
    }
};

var cbAceStringify = function(obj, surround, replace, format) {
    surround ? surround : surround = "";
    var jsonStr = format != false ? JSON.stringify(obj, null, 2).replace(/\\\\/g, "\\") : JSON.stringify(obj, null).replace(/\\\\/g, "\\");
    if (replace != false) {
        jsonStr = jsonStr.replace(/"/g, '\'');
    }
    jsonStr = surround + jsonStr + surround;
    return jsonStr;
};

var cbObj2Array = function (obj) {
    return Object.keys(obj).map(function (key) {
        return {name: key, body: obj[key]};
    })
};

var esBuckets = [
    {
        name: "date_hist",
        body: {
            date_histogram: {field: '<columnname>', format: 'yyyy-MM-dd HH:mm:ss', interval: '10m', time_zone: '+08:00'}
        }
    },
    {
        name: "number_range",
        body: {
            range: { field: '<columnname>', ranges: [{to: 10000}, {from: 10000, to: 30000}, {from: 30000}] }
        }
    },
    {
        name: "number_hist",
        body: {
            histogram : {
                field: '<columnname>',
                interval: 50,
                min_doc_count: 1,
                missing: 0
            }
        }
    }
];

var cbEsQueryCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, esBuckets.map(function(aggObj) {
            return {
                meta: "es-bucket",
                caption: aggObj.name,
                value: "\"<columnname>\": " + cbAceStringify(aggObj.body, null, false)
            };
        }));
    }
};

var cbEsSchemaORCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, esBuckets.map(function(aggObj) {
            return {
                meta: "es-bucket",
                caption: aggObj.name,
                value: "\"esBucket\": " + cbAceStringify(aggObj.body, null, false)
            };
        }));
    }
};

var esFilter = {
    termFilter: {
        term: {'<filter_column>': '<value>'}
    },
    termsFilter: {
        terms: {'<filter_column>': ['<value1>', '<value2>']}
    },
    rangeFilter: {
        range: {'<filter_column>': {gte: 10, lte: 20}}
    },
    boolFilter: {
        bool: {must: [{}], must_not: [{}], should: [{}]}
    }
};

var cbEsAggComList = cbObj2Array(esFilter).map(function(filter) {
    return {
        meta: "es-agg",
        caption: filter.name + " Agg",
        value: cbAceStringify({
            column: '<agg_column>',
            filter: filter.body
        }, '"')
    };
});

cbEsAggComList.push({
    meta: "es-agg",
    caption: "Not Equal Agg",
    value: cbAceStringify({
        column: '<agg_column>',
        filter: {
            bool: {
                must_not: esFilter.termFilter
            }
        }
    }, '"')
});

cbEsAggComList.push({
    meta: "es-agg",
    caption: "Inline Script Agg",
    value: cbAceStringify({
        column: '<agg_column>',
        script: {
            inline: 'if(doc[\\\'column_name\'].value==\\\'F\\\') {1} else {0}'
        }
    }, '"')
});

var cbEsExpAggCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, cbEsAggComList);
    }
};

var cbEsExpFilterCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        var cbEsFilterComList = cbObj2Array(esFilter).map(function(filter) {
            return {
                meta: "es-filter",
                caption: filter.name,
                value: cbAceStringify(filter.body, null, null, false)
            };
        });
        callback(null, cbEsFilterComList);
    }
};


// Below functions return options for ace ui
var datasetEditorOptions = function () {
    var result = angular.copy(cbAcebaseOption);
    result.onLoad = function(_editor) {
        _editor.completers = [];
        _editor.completers.push(cbEsQueryCompleter);
    };
    return result;
};

var schemaCustomOpt = function(selects, sourceType) {
    var result = angular.copy(cbAcebaseOption);
    var selectsCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            callback(null, selects.map(function (word) {
                var value = word.column ? word.column : word;
                return {
                    caption: word.alias ? word.alias : value,
                    value: value,
                    meta: "selects"
                };
            }));
        }
    };
    result.onLoad = function(_editor) {
        _editor.completers = [];
        _editor.completers.push(selectsCompleter);
        if (sourceType !== null && sourceType.toLowerCase().indexOf("elasticsearch") > -1) {
            _editor.completers.push(cbEsSchemaORCompleter);
        }
    };
    return result;
};

var expEditorOptions = function (selects, aggs, extOnload) {
    var result = angular.copy(cbAcebaseOption);
    var selectsCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            callback(null, selects.map(function (word) {
                var value = word.column ? word.column : word;
                return {
                    caption: word.alias ? word.alias : value,
                    value: value,
                    meta: "selects"
                };
            }));
        }
    };

    var aggsCompleter;
    if (aggs) {
        aggsCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                callback(null, aggs.map(function(agg) {
                    return {
                        caption: agg.name,
                        value: agg.name + "()",
                        meta: "aggregate"
                    };
                }));
            }
        }
    }

    result.onLoad = function(_editor) {
        _editor.completers = [];
        _editor.completers.push(cbEsExpAggCompleter);
        _editor.completers.push(cbEsExpFilterCompleter);
        _editor.completers.push(selectsCompleter);
        _editor.completers.push(aggsCompleter);
        if (extOnload) {
            extOnload(_editor);
        }
        _editor.focus();

    };
    return result;
};