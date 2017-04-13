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

var cbAceCmpEsBucket = [
    {
        meta: "cboard",
        caption: "date_hist",
        value: "  '<columnname>': {\n    'date_histogram': {\n      'field': '<columnname>',\n      'format': 'yyyy-MM-dd HH:mm:ss',\n      'interval': '10m',\n      'time_zone': '+08:00'\n    }\n  }"
    },
    {
        meta: "cboard",
        caption: "number_range",
        value: "  '<columnname>': {\n    'range': {\n      'field': '<columnname>',\n      'ranges': [\n        {'to': 10000}, \n        {'from': 10000, 'to': 30000},\n        {'from': 30000}\n      ]\n    }\n  }"
    }
];

var cbEsQueryCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, cbAceCmpEsBucket);
    }
};

var widgetEditorOptions = function () {
    var result = cbAcebaseOption;
    cbAcebaseOption.onLoad = function(_editor) {
        _editor.completers = [];
        _editor.completers.push(cbEsQueryCompleter);
    };
    return result;
}();


var cbAceCmpEsExp = [
    {
        meta: "cboard",
        caption: "Term Filter on Agg",
        value: "\"{\n  'column': '<agg_column>',\n  'filter': {\n    'term': {\n      '<filter_column>': '<value>'\n    }\n  }\n}\""
    },
    {
        meta: "cboard",
        caption: "Terms Filter on Agg",
        value: "\"{\n  'column': '<agg_column>',\n  'filter': {\n    'terms': {\n      '<filter_column>': '[<value>, <value>]'\n    }\n  }\n}\""
    },
    {
        meta: "cboard",
        caption: "Bool Filter on Agg",
        value: "\"{\n  'column': '<agg_column>',\n  'filter': {\n     'bool': {\n       'must': <filter>,\n       'must_not': <filter>,\n       'should': <filter>\n     }\n  }\n}\""
    },
    {
        meta: "cboard",
        caption: "Term Filter",
        value: "'term': { '<filter_column>': '<value>' }"
    },
    {
        meta: "cboard",
        caption: "Terms Filter",
        value: "'terms': { '<filter_column>': [<value>, <value>] }"
    },
    {
        meta: "cboard",
        caption: "Range Filter",
        value: "'range': { '<filter_column>': [ 10 TO  *] }"
    }
];

var cbEsExpCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, cbAceCmpEsExp);
    }
};

var expEditorOptions = function (selects) {
    var result = cbAcebaseOption;
    var selectsCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            callback(null, selects.map(function(word) {
                return {
                    caption: word,
                    value: word,
                    meta: "selects"
                };
            }));
        }
    };
    cbAcebaseOption.onLoad = function(_editor) {
        _editor.completers = [];
        _editor.completers.push(cbEsExpCompleter);
        _editor.completers.push(selectsCompleter);
    };
    return result;
};