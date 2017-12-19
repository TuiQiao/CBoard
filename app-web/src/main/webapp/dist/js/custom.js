/**
 * Created by zyong on 2017/11/30.
 */

var historyVal = $('#sidebar-menu').html();
//每隔1秒执行检测
setInterval(function () {
    var curVal = $('#sidebar-menu').html();
    if (curVal !== historyVal) { // 检测到不相同
        historyVal = curVal;
        notifyme();
    }
}, 1000);

function notifyme() {
    var menuActive = [];
    var navNames = [];

    var li_1 = $('#sidebar-menu').children("li");
    $(li_1).each(function (index, element) {
        if ($(element).attr("class").indexOf("active") > -1) {
            menuActive.push(index);
            setSessionStorage(menuActive);

            var li_2 = $(element).children("ul").children("li");
            if (li_2) {
                $(li_2).each(function (index, element) {
                    if ($(element).attr("class").indexOf("active") > -1) {
                        menuActive.push(index);
                        setSessionStorage(menuActive);

                        var li_3 = $(element).children("ul").children("li");
                        if (li_3) {
                            $(li_3).each(function (index, element) {
                                if ($(element).attr("class").indexOf("active") > -1) {
                                    menuActive.push(index);
                                    setSessionStorage(menuActive);
                                    return;
                                }
                            });

                        } else {
                            return;
                        }
                    }
                });

            } else {
                return;
            }
        }
    });

    if (sessionStorage.getItem("menuActive")) {
        setMenuActive(sessionStorage.getItem("menuActive"));
    }
}

function setSessionStorage(menuActive) {
    sessionStorage.setItem("menuActive", menuActive);
}

function setMenuActive(menuActive) {
    menuActive = menuActive.split(",");
    var li_1 = $('#sidebar-menu').children("li");
    if (li_1) {
        var activeLi_1 = li_1[parseInt(menuActive[0])];
        $(activeLi_1).attr("class", "active");

        var li_2 = $(activeLi_1).children("ul").children("li");
        if (li_2) {
            var activeLi_2 = li_2[parseInt(menuActive[1])];
            $(activeLi_2).attr("class", "active");

            var li_3 = $(activeLi_2).children("ul").children("li");
            if (li_3) {
                var activeLi_3 = li_3[parseInt(menuActive[2])];
                $(activeLi_3).attr("class", "item ng-scope active");

            }
        }
    }
}
