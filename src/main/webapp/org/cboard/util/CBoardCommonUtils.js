/**
 * Created by zyong on 2016/8/2.
 */
// 生成随机字符串
function randomStr() {
    return Math.random().toString(36).substring(2);
}

/**
 * 字符串模板变量替换
 * @param template
 * @param context
 * @returns {void|string|XML|*|{by}|{state, paramExpr}}
 */
function render(template, context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
    return template.replace(tokenReg, function (word, slash1, token, slash2) {
        if (slash1 || slash2) {
            return word.replace('\\', '');
        }
        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var i, length, variable;
        for (i = 0, length = variables.length; i < length; ++i) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) return '{'+token+'}';
        }
        return currentObject;
    })
}

String.prototype.render = function (context) {
    return render(this, context);
};


function dataStructure(d) {
    var dataString = d ? d.toString(): "";
    var isNumber = /^\d+(\.\d+)?$/.test(dataString);
    var intBit = isNumber ? dataString.split("\.")[0].length : 0;
    var floatBit = isNumber && dataString.indexOf(".") != -1 ? dataString.split("\.")[1].length : 0;
    return {
        isNumber: isNumber,
        intBit: intBit,
        floatBit: floatBit
    };
}

function dataFormat(d) {
    var ds = dataStructure(d);
    if (ds.isNumber) {
        return numbro(d).format("0.[0000]");
    } else {
        return d;
    }
}

// Verify whether the aggregation expression is valid
function verifyAggExpRegx(exp) {

    var result = { isValid:  false, msg: "" };

    var exp = exp.replace(/\s/g, '').replace(/(sum|avg|count|max|min)\([\u4e00-\u9fa5_a-zA-Z0-9]+\)/g, '1');

    try {
        eval(exp);
    } catch (e) {
        result.msg = e.message;
        return result;
    }

    result.isValid = true;
    result.msg = "ok!";
    return result;
}

function cboardTranslate(path) {
    var keys = path.split(".");
    var exp = "CB_I18N";
    for(var i = 0; i < keys.length; i++) {
        exp += "['" + keys[i] + "']";
    }
    var result = eval(exp);
    return result ? result : path;
}
