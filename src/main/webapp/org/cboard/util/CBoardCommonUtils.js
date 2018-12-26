/**
 * Created by zyong on 2016/8/2.
 */
// 生成随机字符串
function randomStr() {
    return Math.random().toString(36).substring(2);
}

function render(template, context, tokenReg, hasDollarPrefix, resultProcessor) {
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
            if (currentObject === undefined || currentObject === null) {
                if (hasDollarPrefix === true) {
                    return '${'+token+'}';
                } else {
                    return '{'+token+'}';
                }
            }
        }
        if (resultProcessor) {
            return resultProcessor(currentObject);
        } else {
            return currentObject;
        }
    })
}

String.prototype.render = function (context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
    return render(this, context, tokenReg);
};

/**
 * 字符串模板变量替换 replace ${name} style variable
 * @param template
 * @param context
 * @returns {void|string|XML|*|{by}|{state, paramExpr}}
 */
String.prototype.render2 = function(context, resultProcessor) {
    var tokenReg = /(\\)?\$\{([^\{\}\\]+)(\\)?\}/g;
    return render(this, context, tokenReg, true, resultProcessor);
};

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
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


function UserException(message) {
    this.message = message;
    this.name = 'UserException';
}