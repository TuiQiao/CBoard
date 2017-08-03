// 加密方法。没有过滤首尾空格，即没有trim。
// 可以加密N次，对应的需要解密N次。
function encodeBase64(str, times) {
    var code = "";
    var num = 1;
    if (typeof times != 'undefined' && times != null && times != "") {
        var vt = times + "";
        num = parseInt(vt);
    }
    //$.base64.utf8encode = true;
    code = str;
    for (var i = 0; i < num; i++) {
        code = $.base64.encode(code);
        //code = $.base64.btoa(code);
    }
    return code;
}

// 解密方法。没有过滤首尾空格，即没有trim。
// 可以加密N次，对应的需要解密N次。
function decodeBase64(str, times) {
    var decode = "";
    var num = 1;
    if (typeof times != 'undefined' && times != null && times != "") {
        var vt = times + "";
        num = parseInt(vt);
    }
    //$.base64.utf8encode = true;
    decode = str;
    for (var i = 0; i < num; i++) {
        decode = $.base64.decode(decode);
        //decode = $.base64.atob(decode);
    }
    return decode;
}

// 新加密方法。没有过滤首尾空格，即没有trim。
// 指定加密键值，对应的需要指定相同解密键值。
// 可以加密N次，对应的需要解密N次。
function encodeBase64New(str, key, times) {
    var code = "";
    var num = 1;
    if (typeof times != 'undefined' && times != null && times != "") {
        var vt = times + "";
        num = parseInt(vt);
    }
    if (typeof key == 'undefined' || key == null) {
        key = "";
    }
    //$.base64.utf8encode = true;
    code = str;
    key = "\007" + key;
    for (var i = 0; i < num; i++) {
        code = code + key;
        code = $.base64.encode(code);
        //code = $.base64.btoa(code);
    }
    return code;
}

// 新解密方法。没有过滤首尾空格，即没有trim。
// 指定加密键值，对应的需要指定相同解密键值。
// 可以加密N次，对应的需要解密N次。
function decodeBase64New(str, key, times) {
    var decode = "";
    var num = 1;
    if (typeof times != 'undefined' && times != null && times != "") {
        var vt = times + "";
        num = parseInt(vt);
    }
    if (typeof key == 'undefined' || key == null) {
        key = "";
    }
    //$.base64.utf8encode = true;
    decode = str;
    key = "\007" + key;
    for (var i = 0; i < num; i++) {
        decode = $.base64.decode(decode);
        //decode = $.base64.atob(decode);
        decode = decode.replace(key, "");
    }
    return decode;
}