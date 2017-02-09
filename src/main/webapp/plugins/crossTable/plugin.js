/**
 * Created by Fine on 2016/12/4.
 */

var crossTable = {
    table: function (args) {
        var data = args.data,
            chartConfig = args.chartConfig,
            tall = args.tall,
            pageDataNum = 20,
            random = Math.random().toString(36).substring(2),
            container = args.container;
        var html = "<table class = 'table_wrapper' id='tableWrapper" + random + "'><thead class='fixedHeader'>",
            colContent = "<tr>";
        for (var i = 0; i < chartConfig.groups.length; i++) {
            var colspan = 1;
            var colList = [];
            for (var t = 0; t < chartConfig.keys.length; t++) {
                colContent += "<th class=" + data[i][t].property + "><div></div></th>";
            }
            for (var y = chartConfig.keys.length; y < data[i].length; y++) {
                if ((data[i][y + 1]) && (data[i][y].data == data[i][y + 1].data)) {
                    if (i > 0) {
                        var noEqual = false;
                        for (var s = i - 1; s > -1; s--) {
                            if (data[s][y].data != data[s][y + 1].data) {
                                noEqual = true;
                                break;
                            }
                        }
                        if (noEqual) {
                            colList.push({
                                data: data[i][y].data,
                                colSpan: colspan,
                                property: data[i][y].property
                            });
                            colspan = 1;
                        }
                        else {
                            colspan++;
                        }
                    }
                    else if (i == 0) {
                        colspan++;
                    }
                }
                else {
                    data[i][y] != data[i][y - 1] ? colList.push({
                        data: data[i][y].data,
                        colSpan: colspan,
                        property: data[i][y].property
                    }) : null;
                    colspan = 1;
                }
            }
            for (var c = 0; c < colList.length; c++) {
                colContent += colList[c].colSpan > 1 ? "<th colspan=" + colList[c].colSpan +
                " class=" + colList[c].property + "><div>" + colList[c].data + "</div></th>" :
                "<th class=" + colList[c].property + "><div>" + colList[c].data + "</div></th>";
            }
            colContent += "</tr><tr>";
        }
        for (var k = 0; k < data[chartConfig.groups.length].length; k++) {
            colContent += "<th class=" + data[chartConfig.groups.length][k].property + "><div>" + data[chartConfig.groups.length][k].data + "</div></th>";
        }
        html += colContent + "</tr></thead><tbody class='scrollContent'>";
        var dataPage = this.paginationProcessData(data, chartConfig.groups.length + 1, pageDataNum);
        var colNum = dataPage[0][0].length;
        var rowNum = colNum ? data.length : 0;
        var trDom = this.render(dataPage[0], chartConfig);
        html = html + trDom + "</tbody></table>";
        var optionDom = "<select><option value='20'>20</option><option value='50'>50</option><option value='100'>100</option><option value='150'>150</option></select>";
        var p_class = "p_" + random;
        var PaginationDom = "<div class='" + p_class + "'><div class='optionNum'><span>Show</span>" + optionDom + "<span>entries</span></div><div class='page'><ul></ul></div></div>";
        var operate = "<div class='toolbar toolbar" + random + "'><span class='info'><b>info: </b>" + colNum + " x " + rowNum + "</span>" +
            "<span class='exportBnt' title='export'></span></div>";
        $(container).html(operate);
        $(container).append("<div class='tableView table_" + random + "' style='width:99%;max-height:" + tall + "px;overflow:auto'>" + html + "</div>");
        $(container).append(PaginationDom);
        var pageObj = {
            data: dataPage,
            chartConfig: chartConfig
        };
        chartConfig.values[0].cols.length ? this.renderPagination(dataPage.length, 1, pageObj, $('.' + p_class + ' .page>ul')[0]) : null;
        this.clickPageNum(dataPage, chartConfig, p_class);
        this.clickNextPrev(dataPage.length, pageObj, p_class);
        this.selectDataNum(data, chartConfig.groups.length + 1, chartConfig, p_class);
        this.export(random);
    },
    paginationProcessData: function (rawData, headerLines, pageSize) {
        var dataLength = rawData.length - headerLines;
        var lastPageLines = dataLength % pageSize;
        var fullSizePages = parseInt(dataLength / pageSize);
        var totalPages;
        lastPageLines == 0 ? totalPages = fullSizePages : totalPages = fullSizePages + 1;
        var pageData = [];
        for (var currentPage = 1; currentPage < totalPages + 1; currentPage++) {
            var startRow = (currentPage - 1) * pageSize + headerLines;
            var partData = rawData.slice(startRow, startRow + pageSize);
            pageData.push(partData);
        }
        return pageData;
    },
    render: function (data, chartConfig) {
        var html = '';
        for (var r = 0; r < chartConfig.keys.length; r++) {
            for (var n = 1; n < data.length; n++) {
                var node = data[n][r].data;
                if (r > 0) {
                    var parent = data[n][r - 1].data;
                    var next;
                    n > 0 ? next = data[n - 1][r - 1].data : null;
                    (node == data[n - 1][r].data && parent == next) ? data[n][r] = {
                        data: data[n][r].data,
                        rowSpan: 'row_null',
                        property: data[n][r].property
                    } : data[n][r] = {
                        data: data[n][r].data,
                        rowSpan: 'row',
                        property: data[n][r].property
                    };
                }
                else if (r == 0) {
                    var preNode = n > 0 ? data[n - 1][r].data : null;
                    (node == preNode) ? data[n][r] = {
                        data: data[n][r].data,
                        rowSpan: 'row_null',
                        property: data[n][r].property
                    } : data[n][r] = {
                        data: data[n][r].data,
                        rowSpan: 'row',
                        property: data[n][r].property
                    };
                }
            }
        }
        for (var n = 0; n < data.length; n++) {
            var rowContent = "<tr>";
            var isFirstLine = (n == 0) ? true : false;
            for (var m = 0; m < chartConfig.keys.length; m++) {
                var currentCell = data[n][m];
                var rowParentCell = data[n][m - 1];
                if (m > 0) {
                    if (currentCell.rowSpan == 'row_null' && rowParentCell.rowSpan == 'row_null' && !isFirstLine) {
                        rowContent += "<th class=row_null><div></div></th>";
                    } else {
                        rowContent += "<th class=row><div>" + currentCell.data + "</div></th>";
                    }
                } else {
                    if (currentCell.rowSpan == 'row_null' && !isFirstLine) {
                        rowContent += "<th class=row_null><div></div></th>";
                    } else {
                        rowContent += "<th class=row><div>" + currentCell.data + "</div></th>";
                    }
                }
            }
            for (var y = chartConfig.keys.length; y < data[n].length; y++) {
                rowContent += "<td class=" + data[n][m].property + "><div>" + data[n][y].data + "</div></td>";
            }
            html = html + rowContent + "</tr>";
        }
        return html;
    },
    selectDataNum: function (data, num, chartConfig, random) {
        var _this = this;
        $('.' + random).on('change', '.optionNum select', function (e) {
            var pageDataNum = e.target.value;
            var dataPage = _this.paginationProcessData(data, num, pageDataNum);

            var dom = $(e.target.offsetParent).find('.page>ul')[0];
            var tbody = $(e.target.offsetParent).find('tbody')[0];
            tbody.innerHTML = (_this.render(dataPage[0], chartConfig));
            _this.renderPagination(dataPage.length, 1, null, dom);
            $('.' + random).off('click');
            _this.clickPageNum(dataPage, chartConfig, random);
            var pageObj = {
                data: dataPage,
                chartConfig: chartConfig
            };
            _this.clickNextPrev(dataPage.length, pageObj, random);
        });
    },
    clickPageNum: function (data, chartConfig, random) {
        var _this = this;
        $('.' + random).on('click', 'a.pageLink', function (e) {
            var pageNum = e.target.innerText - 1;
            var pageObj = {
                data: data,
                chartConfig: chartConfig
            };

            var dom = $(e.target.offsetParent).find('.page>ul')[0];
            var tbody = $(e.target.offsetParent).find('tbody')[0];
            tbody.innerHTML = _this.render(data[pageNum], chartConfig);
            _this.renderPagination(data.length, parseInt(e.target.innerText), pageObj, dom);
        });
    },
    renderPagination: function (pageCount, pageNumber, pageObj, target) {
        var liStr = '<li><a class="previewLink">Preview</a></li>';
        if (pageCount < 10) {
            for (var a = 0; a < pageCount; a++) {
                liStr += '<li><a class="pageLink">' + (a + 1) + '</a></li>';
            }
        }
        else {
            if (pageNumber < 6) {
                for (var a = 0; a < pageNumber + 2; a++) {
                    liStr += '<li><a class="pageLink">' + (a + 1) + '</a></li>';
                }
                liStr += '<li class="disable"><span class="ellipse">...</span></li>';
                for (var i = pageCount - 2; i < pageCount; i++) {
                    liStr += '<li><a class="pageLink">' + (i + 1) + '</a></li>';
                }
            } else if (pageNumber <= (pageCount - 5)) {
                for (var c = 0; c < 2; c++) {
                    liStr += '<li><a class="pageLink">' + (c + 1) + '</a></li>';
                }
                liStr += '<li class="disable"><span class="ellipse">...</span></li>';
                for (var j = pageNumber - 2; j < pageNumber + 3; j++) {
                    liStr += '<li><a class="pageLink">' + j + '</a></li>';
                }
                liStr += '<li class="disable"><span class="ellipse">...</span></li>';
                for (var i = pageCount - 2; i < pageCount; i++) {
                    liStr += '<li><a class="pageLink">' + (i + 1) + '</a></li>';
                }
            } else {
                for (var c = 0; c < 2; c++) {
                    liStr += '<li><a class="pageLink">' + (c + 1) + '</a></li>';
                }
                liStr += '<li class="disable"><span class="ellipse">...</span></li>';
                for (var i = pageNumber - 2; i < pageCount + 1; i++) {
                    liStr += '<li><a class="pageLink">' + i + '</a></li>';
                }
            }
        }
        liStr += '<li><a class="nextLink">Next</a></li>';
        if (target) {
            target.innerHTML = liStr;
            if (pageNumber == 1) {
                target.childNodes[0].setAttribute('class', 'hide');
            } else if (pageNumber == pageCount) {
                target.childNodes[target.childNodes.length - 1].setAttribute('class', 'hide');
            }
            this.buttonColor(pageNumber, target);
        }
        // else {
        //     $('.page>ul').html(liStr);
        //     if (pageNumber == 1) {
        //         $('.page a.previewLink').addClass('hide');
        //     } else if (pageNumber == pageCount) {
        //         $('.page a.nextLink').addClass('hide');
        //     }
        //     this.buttonColor(pageNumber);
        //     this.clickNextPrev(pageCount, pageObj);
        // }
    },
    buttonColor: function (pageNum, target) {
        console.log($(target));
        if (target) {
            var buttons = target.childNodes;
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].childNodes[0].innerText == pageNum ? $(buttons[i].childNodes[0]).addClass('current') : null;
            }
        }
    },
    clickNextPrev: function (pageCount, pageObj, random) {
        var _this = this;
        $('.' + random).on('click', '.page a.previewLink', function (e) {
            var kids = e.target.parentNode.parentNode.childNodes;
            var dom = e.target.parentNode.parentNode.parentNode.childNodes[0];
            var tbody = $(e.target.offsetParent).find('tbody')[0];

            for (var i = 0; i < kids.length; i++) {
                if (kids[i].childNodes[0].className.indexOf('current') > -1) {
                    var pageNum = parseInt(kids[i].childNodes[0].text) - 1;
                }
            }
            tbody.innerHTML = _this.render(pageObj.data[pageNum - 1], pageObj.chartConfig);
            _this.renderPagination(pageCount, pageNum, pageObj, dom);
            //_this.clickPageNum(pageObj.data, pageObj.chartConfig);
        });
        $('.' + random).on('click', '.page a.nextLink', function (e) {
            var kids = e.target.parentNode.parentNode.childNodes;
            var dom = e.target.parentNode.parentNode.parentNode.childNodes[0];
            var tbody = $(e.target.offsetParent).find('tbody')[0];

            for (var i = 0; i < kids.length; i++) {
                if (kids[i].childNodes[0].className.indexOf('current') > -1) {
                    var pageNum = parseInt(kids[i].childNodes[0].text) + 1;
                }
            }
            tbody.innerHTML = _this.render(pageObj.data[pageNum - 1], pageObj.chartConfig);
            _this.renderPagination(pageCount, pageNum, pageObj, dom);
            //_this.clickPageNum(pageObj.data, pageObj.chartConfig);
        });
    },
    export: function (random) {
        var idTmr;

        function getExplorer() {
            var explorer = window.navigator.userAgent;
            if (explorer.indexOf("MSIE") >= 0) {
                return 'ie';
            }
            else if (explorer.indexOf("Firefox") >= 0) {
                return 'Firefox';
            }
            else if (explorer.indexOf("Chrome") >= 0) {
                return 'Chrome';
            }
            else if (explorer.indexOf("Opera") >= 0) {
                return 'Opera';
            }
            else if (explorer.indexOf("Safari") >= 0) {
                return 'Safari';
            }
        };

        function Cleanup() {
            window.clearInterval(idTmr);
            CollectGarbage();
        };

        var tableToExcel = (function () {
            var uri = 'data:application/vnd.ms-excel;base64,',
                template = '<html><head><meta charset="UTF-8"></head><body><table>{table}</table></body></html>',
                base64 = function (s) {
                    return window.btoa(unescape(encodeURIComponent(s)))
                },
                format = function (s, c) {
                    return s.replace(/{(\w+)}/g,
                        function (m, p) {
                            return c[p];
                        })
                };
            return function (table, name) {
                if (!table.nodeType) table = document.getElementById(table);
                var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML};
                window.location.href = uri + base64(format(template, ctx))
            }
        })();

        $(".toolbar" + random + " .exportBnt").on('click', function () {
            if (getExplorer() == 'ie') {
                var curTbl = document.getElementById('tableWrapper' + random);
                var oXL = new ActiveXObject("Excel.Application");
                var oWB = oXL.Workbooks.Add();
                var xlsheet = oWB.Worksheets(1);
                var sel = document.body.createTextRange();
                sel.moveToElementText(curTbl);
                sel.select();
                sel.execCommand("Copy");
                xlsheet.Paste();
                oXL.Visible = true;
                try {
                    var fname = oXL.Application.GetSaveAsFilename("Excel .xls", "Excel Spreadsheets (* .xls), * .xls");
                } catch (e) {
                    print("Nested catch caught " + e);
                } finally {
                    oWB.SaveAs(fname);
                    oWB.Close(savechanges = true);
                    oXL.Quit();
                    oXL = null;
                    idTmr = window.setInterval("Cleanup();", 1);
                }
            } else {
                tableToExcel('tableWrapper' + random);
            }
        });
    }
};