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

var cbAceStringify = function(obj, surround) {
    surround ? surround : surround = "";
    return surround + JSON.stringify(obj, null, 2).replace(/"/g, '\'') + surround;
};

var cbAceCmpEsBucketObj = {
    dateHist: {
        date_histogram: {
            field: '<columnname>',
            format: 'yyyy-MM-dd HH:mm:ss',
            interval: '10m',
            time_zone: '+08:00'
        }
    },
    numRange: {
        range: {
            field: '<columnname>',
            ranges: [
                {to: 10000},
                {from: 10000, to: 30000},
                {from: 30000}
            ]
        }
    },
    termFilterAgg: {
        column: '<agg_column>',
        filter: {
            term: {
                '<filter_column>': '<value>'
            }
        }
    },
    termsFilterAgg: {
        column: '<agg_column>',
        filter: {
            terms: {
                '<filter_column>': ['<value1>', '<value2>']
            }
        }
    },
    boolFilterAgg: {
        column: '<agg_column>',
        filter: {
            bool: {
                must: [{}],
                must_not: [{}],
                should: [{}]
            }
        }
    }
};

var cbAceCmpEsBucket = [
    {
        meta: "es",
        caption: "date_hist",
        value: "'<columnname>': " + cbAceStringify(cbAceCmpEsBucketObj.dateHist)
    },
    {
        meta: "es",
        caption: "number_range",
        value: "'<columnname>': " + cbAceStringify(cbAceCmpEsBucketObj.numRange)
    }
];

var cbEsQueryCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, cbAceCmpEsBucket);
    }
};

var widgetEditorOptions = function () {
    var result = angular.copy(cbAcebaseOption);
    result.onLoad = function(_editor) {
        _editor.completers = [];
        _editor.completers.push(cbEsQueryCompleter);
    };
    return result;
}();


var cbAceCmpEsExp = [
    {
        meta: "es",
        caption: "Term Filter Agg",
        value: cbAceStringify(cbAceCmpEsBucketObj.termFilterAgg, '"')
    },
    {
        meta: "es",
        caption: "Terms Filter Agg",
        value: cbAceStringify(cbAceCmpEsBucketObj.termsFilterAgg, '"')
    },
    {
        meta: "es",
        caption: "Bool Filter Agg",
        value: cbAceStringify(cbAceCmpEsBucketObj.boolFilterAgg, '"')
    },
    {
        meta: "es",
        caption: "Term Filter",
        value: "'term': { '<filter_column>': '<value>' }"
    },
    {
        meta: "es",
        caption: "Terms Filter",
        value: "'terms': { '<filter_column>': [<value>, <value>] }"
    },
    {
        meta: "es",
        caption: "Range Filter",
        value: "'range': { '<filter_column>': [ 10 TO  *] }"
    }
];

var cbEsExpCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, cbAceCmpEsExp);
    }
};

var expEditorOptions = function (selects, aggs) {
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
        _editor.completers.push(cbEsExpCompleter);
        _editor.completers.push(selectsCompleter);
        _editor.completers.push(aggsCompleter);
    };
    return result;
};