"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if (!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

var page = require('webpage').create();
var system = require('system');
page.viewportSize = {width: 1500, height: 1080};
var _url = 'http://127.0.0.1:8026/render.html#?id=' + system.args[1] + '&pid=' + system.args[2];
phantom.addCookie({
    'name'     : 'CBLOCALUID',   /* required property */
    'value'    : system.args[3],  /* required property */
    'domain'   : '127.0.0.1',
    'path'     : '/',                /* required property */
    'httponly' : true,
    'secure'   : false,
    'expires'  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
});
page.open(_url, function (status) {
    if (status !== 'success') {
        console.log('open page fail!');
        phantom.exit();
    } else {
        waitFor(function () {
            return page.evaluate(function () {
                return $(".persistFinish").length > 0;
            });
        }, function () {
            phantom.exit();
        }, 300000);
    }
});
