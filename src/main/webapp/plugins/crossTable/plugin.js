/**
 * Created by Fine on 2016/12/4.
 * Refactored by Peter on 2017/12/14.
 *  Change object to a class, simplify main function of table. Use render util to build html.
 *  Add dynamic pagination and dynamic row height.
 *  Refactor and simplify merge logical.
 *  Fix some bugs.
 */
var CBCrossTable = function(args) {
    this.args = args;
    this.data = args.data;
    this.chartConfig = args.chartConfig;
    this.drill = args.drill;
    this.tall = args.tall;
    this.random = Math.random().toString(36).substring(2);
    this.toolbarDivId = "toolbar_" + this.random;
    this.tableDivId = "table_" + this.random;
    this.pageDivId = "page_" + this.random;
    this.container = args.container;
    this.totalRow = this.data.length;

    this.vHeaderRowIdx = this.chartConfig.groups.length;
    this.colHeaderRows = this.chartConfig.groups.length;
    this.dataStartColIdx = this.chartConfig.keys.length;
    this.rowHeaderWidth = this.chartConfig.keys.length;

    this.pageDataNum = this.dynamicPageSize();
    this.pagedData = this.paginationProcessData(this.pageDataNum);
    this.rowHeight = this.adjustRowHeight();
};

CBCrossTable.prototype.dynamicPageSize = function() {
    return Math.floor(this.tall/24) - (this.colHeaderRows + 1);
};

CBCrossTable.prototype.buildPageSelectOpts = function() {
    var opts = [];
    opts.push(this.pageDataNum);
    opts = opts.concat([20, 50, 100, 200]);
    var result = _.chain(opts).reduce(function(result, opt) {
        return result.concat("<option value='{opt}'>{opt}</option>".render({opt: opt}))
    }, "<select>").value();
    return result.concat("</select>");
};

CBCrossTable.prototype.table = function() {
    // --------------------------------------------- Render Start ---------------------------------------------//
    // Infomation and Operation Bannder
    var toolbarTemplate = "\
        <div class='toolbar' id='{toolbarDivId}'> \
            {bannerContent} \
        </div>";
    var toolbar = toolbarTemplate.render({toolbarDivId: this.toolbarDivId, bannerContent: this.getToolBarContent()});

    // Table Body
    var bodyTemplate = "\
        <div id='{tableDivId}' style='width:99%;max-height:{height}px;overflow:auto;'>\
            <table class='table_wrapper'>\
                <thead class='fixedHeader'>\
                    {columnHeader}\
                    {valueHeader}\
                </thead>\
                <tbody class='scrollContent'>\
                    {dataContent}\
                </tbody>\
            </table>\
        </div>";
    var columnHeader = this.genColumnHeader();
    var valueHeader = this.getValueHeader();
    var pagedData = this.paginationProcessData(this.pageDataNum);
    var dataContent = this.getDataContent(pagedData[0]);
    var bodyHtml = bodyTemplate.render({
        tableDivId: this.tableDivId,
        columnHeader: columnHeader,
        valueHeader: valueHeader,
        dataContent: dataContent,
        height: this.tall
    });

    // Pagination
    var pageOptionDom = this.buildPageSelectOpts();
    var pageinationTemplate = "\
        <div id='{pageDivId}'>\
            <div class='optionNum'>\
                <span>{text_show}</span> {pageOptionDom} <span>{text_items}</span>\
            </div>\
            <div class='page'><ul></ul></div>\
        </div>";
    var pageination = pageinationTemplate.render({
        pageDivId: this.pageDivId,
        pageOptionDom: pageOptionDom,
        text_show: cboardTranslate("CROSS_TABLE.SHOW"),
        text_items: cboardTranslate("CROSS_TABLE.ENTRIES")
    });
    // --------------------------------------------- Render End ---------------------------------------------//

    $(this.container).html(
        "<div class='cross_table_view'>\
          {toolbar}\
          {body}\
          {pageination}\
        </div>".render({toolbar: toolbar, body: bodyHtml, pageination: pageination})
    );

    if (this.data.length) {
        // Bind Event
        this.export();
        this.renderPagination(pagedData, 1);
        this.clickPageNum(pagedData);
        this.clickNextPrev(pagedData);
        this.selectPageSize();
    }

};

CBCrossTable.prototype.adjustRowHeight = function() {
    // 23 is a experiment total row of table content
    var standardRowHeight = 24;
    var firstPageRows;
    var h = standardRowHeight;
    if (this.pagedData.length > 1) {
        firstPageRows = this.colHeaderRows + 1 + this.pageDataNum;
    } else {
        firstPageRows = this.data.length;
    }
    if (this.tall/firstPageRows > standardRowHeight) {
        h = Math.floor((this.tall - 4)/firstPageRows);
        h = h > 70 ? 70 : h;
    }
    return h;
};

CBCrossTable.prototype.getValueHeader = function() {
    var chartConfig = this.chartConfig;
    var vHeaderHtml = "<tr style='height: " + this.rowHeight + "px'>";
    var vHeaderData = this.data[this.vHeaderRowIdx];
    var cellTemplate = "<th class='{thClass}' {thStyle}><div>{value}</div></th>";
    for (var c = 0; c < vHeaderData.length; c++) {
        var headerType = vHeaderData[c].column_header_header;
        var style = "";
        if (headerType) {
            var align = chartConfig.keys[c].align;
            if (align) {
                style = this.styleObjToStr({'text-align': align});
            }
        } else {
            var dataAlign = chartConfig.values[0].cols[(c - this.dataStartColIdx) % chartConfig.values[0].cols.length].align;
            if (dataAlign) {
                style = this.styleObjToStr({'text-align': dataAlign});
            }
        }
        vHeaderHtml += cellTemplate.render({
            thClass: vHeaderData[c].property,
            thStyle: style,
            value: vHeaderData[c].data});
    }
    vHeaderHtml += "</tr>";
    return vHeaderHtml;
};

CBCrossTable.prototype.getToolBarContent = function() {
    var headerLines = this.colHeaderRows + 1;
    var colNum = this.data[0].length;
    var rowNum = colNum ? this.totalRow - headerLines : 0;
    var contentTemplate = "<span class='info'><b>info: </b>{rowNum} x {colNum}</span> <span class='exportBnt' title='Export'></span>";
    return contentTemplate.render({rowNum: rowNum, colNum: colNum});
};

// Is all configs, from first index to current index, have sort property
CBCrossTable.prototype.checkSortG = function(configs) {
    var sortg = [];
    for (var idx = 0; idx < configs.length; idx++) {
        var isSortg = true;
        _.each(configs, function (g, i) {
            i <= idx && g.sort === undefined ? isSortg = false : null;
        });
        sortg[idx] = isSortg;
    }
    return sortg;
};

CBCrossTable.prototype.genColumnHeader = function() {
    var drill = this.drill;
    var columnHeader = "";
    var rowLengthOfColHeader = this.colHeaderRows;
    var COLUM_HEADER_SORT_G = this.checkSortG(this.chartConfig.groups);

    for (var r = 0; r < rowLengthOfColHeader; r++) {
        var dataStartColIdx = this.dataStartColIdx;
        var rowData = this.data[r];
        var colspan = 1;
        var colList = [];
        /* Top-Left empty corner */
        columnHeader += "<tr style='height: " + this.rowHeight + "px'>";
        for (var t = 0; t < dataStartColIdx; t++) {
            columnHeader += "<th class='header_empty'><div></div></th>";
        }
        for (cidx = dataStartColIdx; cidx < rowData.length; cidx++) {
            if (
                rowData[cidx + 1] &&  // has next column
                (rowData[cidx].data === rowData[cidx + 1].data) && // equal with next column
                COLUM_HEADER_SORT_G[r]
            ) {
                // Compare parent cell
                var equalG = true;
                for (var pRow = r - 1; pRow >= 0; pRow--) {
                    if (this.data[pRow][cidx].data !== this.data[pRow][cidx + 1].data) {
                        equalG = false;
                        break;
                    }
                }
                if (!equalG) {
                    colList.push({
                        data: rowData[cidx].data,
                        colSpan: colspan,
                        property: rowData[cidx].property
                    });
                    colspan = 1;
                } else {
                    colspan++;
                }
            } else {
                if (rowData[cidx] !== rowData[cidx - 1]) {
                    colList.push({
                        data: rowData[cidx].data,
                        colSpan: colspan,
                        property: rowData[cidx].property
                    });
                }
                colspan = 1;
            }
        }
        var headerDataHtml = "";

        var groupId = this.chartConfig.groups[r].id;
        for (var cidx = 0; cidx < colList.length; cidx++) {
            var drillAttr = this.getDrillAttr(groupId);
            headerDataHtml += "\
                 <th colspan='{colspan}' class='{thClass}'> \
                    <div {drill}>{value}</div> \
                 </th>".render({
                colspan: colList[cidx].colSpan,
                thClass: colList[cidx].property,
                value: colList[cidx].data,
                drill: drillAttr
            });
        }
        columnHeader += headerDataHtml;
        columnHeader += "</tr>";
    }
    return columnHeader;
};

CBCrossTable.prototype.getDrillAttr = function(drillKey) {
    var drill = this.drill;
    var drillAttr = "";
    if (drill && drill.config[drillKey] && (drill.config[drillKey].down || drill.config[drillKey].up)) {
        drillAttr += "class='table_drill_cell'";
        if (drill.config[drillKey].down) {
            drillAttr += " drill-down='" + drillKey + "' ";
        }
        if (drill.config[drillKey].up) {
            drillAttr += " drill-up='" + drillKey + "' ";
        }
    }
    return drillAttr;
};

CBCrossTable.prototype.bandDrillEvent = function (render) {
    var drillCellSelector = '#' + this.tableDivId + ' .table_drill_cell[drill-down]';
    var _this = this;
    $(drillCellSelector).click(function(){
        var down = $(this).attr('drill-down');
        var value = $(this).html();
        _this.drill.drillDown(down, value, render);
    });
    $.contextMenu({
        selector: '#' + this.tableDivId + ' .table_drill_cell',
        build: function ($trigger, e) {
            var down = $trigger.attr('drill-down');
            var up = $trigger.attr('drill-up');
            var value = $trigger.html();
            var items = {};
            if (up) {
                items.up = {name: cboardTranslate("COMMON.ROLL_UP"), icon: "fa-arrow-up"}
            }
            if (down) {
                items.down = {name: cboardTranslate("COMMON.DRILL_DOWN"), icon: "fa-arrow-down"}
            }
            return {
                callback: function (key, options) {
                    if ('up' === key) {
                        _this.drill.drillUp(up, render);
                    } else if ('down' === key) {
                        _this.drill.drillDown(down, value, render);
                    }
                },
                items: items
            };
        }
    });
};

CBCrossTable.prototype.paginationProcessData = function (pageSize) {
    pageSize = parseInt(pageSize);
    var rawData = this.data;
    var headerLines = this.colHeaderRows + 1;
    var dataLength = rawData.length - headerLines;
    var lastPageLines = dataLength % pageSize;
    var fullSizePages = parseInt(dataLength / pageSize);
    var totalPages;
    lastPageLines === 0 ? totalPages = fullSizePages : totalPages = fullSizePages + 1;
    var pageData = [];
    for (var currentPage = 1; currentPage < totalPages + 1; currentPage++) {
        var startRow = (currentPage - 1) * pageSize + headerLines;
        var partData = rawData.slice(startRow, startRow + pageSize);
        pageData.push(partData);
    }
    return pageData;
};

CBCrossTable.prototype.dataWrap = function (data){
    if(data === null || data === "" || !isNaN(Number(data))){
        return data;
    }
    var result = data, len = data.length, s = 40;
    if(data && len > s){
        result = "";
        var curlen = 0, patten = /.*[\u4e00-\u9fa5]+.*$/;
        for(var i = 0; i < len; i++){
            patten.test(data[i]) ? curlen += 2 : curlen++;
            if(curlen >= s){
                curlen = 0;
                result += "<br />";
            }
            result += data[i];
        }
    }
    return result;
};

CBCrossTable.prototype.getDataContent = function (data) {
    var chartConfig = this.chartConfig, drill = this.drill;
    var rowHeaderWidth = this.rowHeaderWidth;
    var ROW_HEADER_SORT_G = this.checkSortG(this.chartConfig.keys);
    var html = '';
    if (data === undefined) {
        return html;
    }

    // Process row header
    for(var r = 1; r < data.length; r++) {
        for (var c = 0; c < rowHeaderWidth; c++) {
            var cell = data[r][c];
            var needMerge = true;
            if (!ROW_HEADER_SORT_G[c]) {
                needMerge = false;
            } else {
                for (var x = c; x >= 0; x--) {
                    if (data[r][x].data !== data[r - 1][x].data) {
                        needMerge = false;
                        break;
                    }
                }
            }
            cell.rowSpan = needMerge ? 'row_null' : 'row';
        }
    }

    for (var r = 0; r < data.length; r++) {
        var rowContent = "<tr style='height: " + this.rowHeight + "px'>";
        var isFirstLine = (r === 0);
        for (var c = 0; c < rowHeaderWidth; c++) {
            var currentCell = data[r][c];
            // add drill event
            var keyId = chartConfig.keys[c].id;
            var drillAttr = this.getDrillAttr(keyId);
            // Align
            var thStyle = "";
            var colAlign = chartConfig.keys[c].align;
            if (colAlign) {
                thStyle = this.styleObjToStr({'text-align': colAlign});
            }
            var rowHeaderDataHtml = "";
            var dataWrap = this.dataWrap(currentCell.data ? currentCell.data : "");
            if (currentCell.rowSpan === 'row_null' && !isFirstLine) {
                rowHeaderDataHtml = "<th class='row_null'><div></div></th>";
            } else {
                rowHeaderDataHtml = "\
                <th class='{class}' {thStyle}>\
                  <div>\
                    <div {drill}>{value}</div>\
                  </div>\
                </th>".render({
                    class: isFirstLine ? 'row' : currentCell.rowSpan,
                    thStyle: thStyle,
                    drill: drillAttr,
                    value: dataWrap
                });
            }
            rowContent += rowHeaderDataHtml;
        }

        // Process row data
        var dataCellStartIdx = this.dataStartColIdx;
        for (var c = dataCellStartIdx; c < data[r].length; c++) {
            var dataAlign = chartConfig.values[0].cols[(c - dataCellStartIdx) % chartConfig.values[0].cols.length].align;
            thStyle = "";
            if (dataAlign) {
                thStyle = this.styleObjToStr({'text-align': dataAlign});
            }
            var celData = this.dataWrap(data[r][c].data);
            var dataHtml = "\
            <td {thStyle} class='{class}'>\
              <div>{value}</div>\
            </td>\
            ".render({thStyle: thStyle, value: celData, class: data[r][c].property});
            rowContent += dataHtml;
        }
        html += (rowContent + "</tr>");
    }
    return html;
};

CBCrossTable.prototype.styleObjToStr = function(styleObj) {
    var styleStr = _.chain(styleObj).keys()
        .reduce(function(result, key) {
            return result.concat(key, ": ", styleObj[key], ";")
        }, "style='").value();
    return styleStr.concat("'");
};

CBCrossTable.prototype.selectPageSize = function () {
    var chartConfig = this.chartConfig,
        drill = this.drill,
        render = this.args.render;
    var _this = this;
    var selector = "#" + this.pageDivId;
    $(selector).on('change', '.optionNum select', function (e) {
        var pageDataNum = e.target.value;
        var pagedData = _this.paginationProcessData(pageDataNum);

        var dom = $(e.target.offsetParent).find('.page>ul')[0];
        var tbody = $(e.target.offsetParent).find('tbody')[0];
        tbody.innerHTML = (_this.getDataContent(pagedData[0], chartConfig, drill));
        _this.renderPagination(pagedData, 1);
        $(selector).off('click');
        _this.clickPageNum(pagedData);
        _this.clickNextPrev(pagedData);
    });
    _this.bandDrillEvent(render);
};
    
CBCrossTable.prototype.clickPageNum = function (data) {
    var _this = this;
    var chartConfig = this.chartConfig, drill = this.drill;
    var pageDivselector = "#" + this.pageDivId;
    $(pageDivselector).on('click', 'a.pageLink', function (e) {
        var pageNum = e.target.innerText - 1;
        var tbody = $(e.target.offsetParent).find('tbody')[0];
        tbody.innerHTML = _this.getDataContent(data[pageNum]);
        _this.renderPagination(data, parseInt(e.target.innerText));
    });
};
    
CBCrossTable.prototype.renderPagination = function (pagedData, pageNumber) {
    var pageCount = pagedData.length;
    var ulSelector = "#" + this.pageDivId + ' .page>ul';
    var target = $(ulSelector)[0];
    if (pageCount == 1) {
        return  target.innerHTML = '';
    }
    var liStr = '<li><a class="previewLink">' + cboardTranslate("CROSS_TABLE.PREVIOUS_PAGE") + '</a></li>';
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
    liStr += '<li><a class="nextLink">' + cboardTranslate("CROSS_TABLE.NEXT_PAGE") + '</a></li>';
    if (target) {
        target.innerHTML = liStr;
        if (pageNumber == 1) {
            target.childNodes[0].setAttribute('class', 'hide');
        } else if (pageNumber == pageCount) {
            target.childNodes[target.childNodes.length - 1].setAttribute('class', 'hide');
        }
        this.buttonColor(pageNumber, target);
    }
};
    
CBCrossTable.prototype.buttonColor = function (pageNum, target) {
    if (target) {
        var buttons = target.childNodes;
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].childNodes[0].innerText == pageNum ? $(buttons[i].childNodes[0]).addClass('current') : null;
        }
    }
};
    
CBCrossTable.prototype.clickNextPrev = function (pagedData) {
    var _this = this;
    var pageCount = pagedData.length;
    var selector = "#" + this.pageDivId;
    $(selector).on('click', '.page a.previewLink', function (e) {
        var kids = e.target.parentNode.parentNode.childNodes;
        var dom = e.target.parentNode.parentNode.parentNode.childNodes[0];
        var tbody = $(e.target.offsetParent).find('tbody')[0];

        for (var i = 0; i < kids.length; i++) {
            if (kids[i].childNodes[0].className.indexOf('current') > -1) {
                var pageNum = parseInt(kids[i].childNodes[0].text) - 1;
            }
        }
        tbody.innerHTML = _this.getDataContent(pagedData[pageNum - 1]);
        _this.renderPagination(pagedData, pageNum);
    });
    $(selector).on('click', '.page a.nextLink', function (e) {
        var kids = e.target.parentNode.parentNode.childNodes;
        var dom = e.target.parentNode.parentNode.parentNode.childNodes[0];
        var tbody = $(e.target.offsetParent).find('tbody')[0];

        for (var i = 0; i < kids.length; i++) {
            if (kids[i].childNodes[0].className.indexOf('current') > -1) {
                var pageNum = parseInt(kids[i].childNodes[0].text) + 1;
            }
        }
        tbody.innerHTML = _this.getDataContent(pagedData[pageNum - 1]);
        _this.renderPagination(pagedData, pageNum);
    });
};
    
CBCrossTable.prototype.export = function () {
    var selector = "#" + this.toolbarDivId + " .exportBnt";
    var _this = this;
    $(selector).on('click', function () {
        var xhr = new XMLHttpRequest();
        var formData = new FormData();
        formData.append('data', JSON.stringify({data: _this.data, type: 'table'}));
        xhr.open('POST', 'dashboard/tableToxls.do');
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            var blob = new Blob([this.response], {type: "application/vnd.ms-excel"});
            var objectUrl = URL.createObjectURL(blob);
            var aForExcel = $("<a><span class='forExcel'>下载excel</span></a>").attr("href", objectUrl);
            aForExcel.attr("download", "table.xls");
            $("body").append(aForExcel);
            $(".forExcel").click();
            aForExcel.remove();
        };
        xhr.send(formData);
    });

};

