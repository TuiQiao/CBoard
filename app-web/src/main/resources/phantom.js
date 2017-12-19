"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function () {
            var elapsedTime = new Date().getTime() - start;
            console.log("elapsedTime:" + elapsedTime + ", [" + maxtimeOutMillis + "]");
            if ((elapsedTime < maxtimeOutMillis) && !condition) {
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
        }, 2000); //< repeat check every 2000ms
}

var page = require('webpage').create();
var system = require('system');
page.viewportSize = {width: 1500, height: 1080};
var _url = system.args[1];
console.log("[PhantomJS] Opening Url:", _url);
page.open(_url, function (status) {
    if (status !== 'success') {
        console.log('open page fail!');
        phantom.exit();
    } else {
        console.log("success");
        waitFor(function () {
            return page.evaluate(function () {
                return $(".persistFinish").length > 0;
            });
        }, function () {
            phantom.exit();
        }, 120000);
    }
});
