/**
 * Created by Fine on 2016/12/13.
 */

'use strict';
var threeLevelMap = {
    container: null,
    tipHeader: null,
    getZoomScale: function(features, width, height){
        var longitudeMin = 100000;
        var latitudeMin = 100000;
        var longitudeMax = 0;
        var latitudeMax = 0;
        features.forEach(function(e){
            var a = d3.geo.bounds(e);
            if(a[0][0] < longitudeMin) {
                longitudeMin = a[0][0];
            }
            if(a[0][1] < latitudeMin) {
                latitudeMin = a[0][1];
            }
            if(a[1][0] > longitudeMax) {
                longitudeMax = a[1][0];
            }
            if(a[1][1] > latitudeMax) {
                latitudeMax = a[1][1];
            }
        });
        var a = longitudeMax - longitudeMin;
        var b = latitudeMax - latitudeMin;
        if(width/height >= a/b){
            return height/b;
        } else {
            return width/a;
        }
    },
    getCenters: function(features){
        var longitudeMin = 100000;
        var latitudeMin = 100000;
        var longitudeMax = 0;
        var latitudeMax = 0;
        features.forEach(function(e){
            var a = d3.geo.bounds(e);
            if(a[0][0] < longitudeMin) {
                longitudeMin = a[0][0];
            }
            if(a[0][1] < latitudeMin) {
                latitudeMin = a[0][1];
            }
            if(a[1][0] > longitudeMax) {
                longitudeMax = a[1][0];
            }
            if(a[1][1] > latitudeMax) {
                latitudeMax = a[1][1];
            }
        });
        var a = (longitudeMax + longitudeMin)/2;
        var b = (latitudeMax + latitudeMin)/2;
        return [a, b];
    },
    fillColor: function (data,name) {
        var rowHeaderLength = 0,
            columnHeaderLength = 0,
            columnHeaderLink = [],
            columnMax,
            columnMin,
            columnList = [],
            dataValue = null;
        data ? data[0].map(function(d){
            d.property == 'header_empty' ? rowHeaderLength++ : null;
        }) : null;
        data.map(function (d) {
            d[0] ? (d[0].property == 'header_empty' ? columnHeaderLength++ : null) : null;
        });
        for (var n = rowHeaderLength; n < data[rowHeaderLength].length; n++) {
            var title = [];
            if (rowHeaderLength) {
                for (var m = 0; m < columnHeaderLength + 1; m++) {
                    title.push(data[m][n].data);
                }
                columnHeaderLink.push(title.join('-'));
                this.tipHeader = columnHeaderLink[0];
            }
            else {
                data[0].map(function (d) {
                    d['column_header_header'] ? rowHeaderLength++ : null;
                });
                this.tipHeader = data[0][rowHeaderLength].data;
                break;
            }
        }
        if (data[0].length) {
            for (var i = columnHeaderLength + 1; i < data.length; i++) {
                (data[i][rowHeaderLength].data == "N/A" ?  columnList.push(0) :
                    columnList.push(parseInt(data[i][rowHeaderLength].data)));
            }
        }
        columnMax = d3.max(columnList);
        columnMin = d3.min(columnList);
        var computeColor = d3.interpolate(d3.rgb(180,227,248), d3.rgb(2,112,221));
        var linear = d3.scale.linear()
            .domain([columnMin, columnMax])
            .range([0, 1]);
        if (data[0].length) {
            data.map(function (d) {
                (d[rowHeaderLength - 1] && d[rowHeaderLength - 1].data) == name ? dataValue = d[rowHeaderLength].data : null;
            });
        }
        if (dataValue < 0){
            color = "#FF7A4C";
        }
        else if (dataValue == null || dataValue == 'N/A'){
            color = "#F0F0F0";
        }
        else {
            var t = linear(dataValue);
            var color = computeColor(t);
        }
        return color;
    },
    tipData: function(data, name) {
        var rowHeaderLength = 0,
            columnHeaderLength = 0,
            tipsArray = [],
            columnHeaderLink = [];
        data ? data[0].map(function(d){
            d.property == 'header_empty' ? rowHeaderLength++ : null;
        }) : null;
        data.map(function (d) {
            d[0] ? (d[0].property == 'header_empty' ? columnHeaderLength++ : null) : null;
        });
        if (data[rowHeaderLength]) {
            for (var n = rowHeaderLength; n < data[rowHeaderLength].length; n++) {
                var title = [];
                if (rowHeaderLength) {
                    for (var m = 0; m < columnHeaderLength + 1; m++) {
                        title.push(data[m][n].data);
                    }
                    columnHeaderLink.push(title.join('-'));
                }
                else {
                    data[0].map(function (d) {
                        d['column_header_header'] ? columnHeaderLink.push(d.data) : rowHeaderLength++;
                    });
                    break;
                }
            }
            for (var k = 0; k < data.length; k++) {
                if (data[k][rowHeaderLength - 1] && data[k][rowHeaderLength - 1].data == name) {
                    for(var t = 0;t < columnHeaderLink.length;t++){
                        var saveHeader = [],
                            headerStr = [];
                        saveHeader.push(columnHeaderLink[t]);
                        data[k][t + rowHeaderLength] ? saveHeader.push(data[k][t + rowHeaderLength].data) :
                        saveHeader.push(data[0][rowHeaderLength].data);
                        headerStr = saveHeader.join(" : ");
                        tipsArray.push(headerStr);
                    }
                    return name+" :</br>"+tipsArray.join("</br>");
                }
            }
        }
    },
    colorRange: function(args) {
        var defs = args.svg.append("defs");
        var linearGradient = defs.append("linearGradient")
            .attr("id","linearColor")
            .attr("x1","0%")
            .attr("y1","0%")
            .attr("x2","0%")
            .attr("y2","100%");

        linearGradient.append("stop")
            .attr("offset","0%")
            .style("stop-color", args.maxColor.toString());

        linearGradient.append("stop")
            .attr("offset","100%")
            .style("stop-color",args.minColor.toString());
        var colorLength = 130;
        var colorWidth = 20;
        args.svg.append("rect")
            .attr("x", args.width * 0.7 - 7)
            .attr("y", args.height * 0.5)
            .attr("width", colorWidth)
            .attr("height", colorLength)
            .style("fill","url(#" + linearGradient.attr("id") + ")");

        //add words
        args.svg.append("text")
            .attr({
                "class": "valueText",
                "x": args.width*0.7 + 5,
                "y": args.height*0.5 - 10,
                "text-anchor": "middle"
            })
            .text(function(){
                return args.contentHeader;
            });
        args.svg.append("text")
            .attr("class", "valueText")
            .attr("x", args.width*0.7 - 40)
            .attr("y", args.height*0.5 + 10)
            .text("High");
        //.text(function(){
        //return minvalue[0];
        //});

        args.svg.append("text")
            .attr("class","valueText")
            .attr("x", args.width*0.7 - 40)
            .attr("y", args.height*0.5 + colorLength)
            .text("Low");
        //.text(function(){
        //	return maxvalue[0];
        //});
    },
    backToTop: function(options) {
        var _this = this;
        options.svg.append('image')
            .attr('x', options.width * 0.7)
            .attr('y', 0)
            .attr('width', 30)
            .attr('height', 30)
            .attr('class', 'backTop')
            .attr('xlink:href', 'imgs/back-top.svg')
            .style('cursor', 'pointer')
            .on('click', function(){
                _this.map(options);
            });
    },
    map: function(options) {
        var chinaPath = 'plugins/FineMap/mapdata/china.json';
        var that = this;
        var width = this.container[0].clientWidth * 0.95;
        d3.select(that.container[0]).selectAll('svg').remove();
        d3.selectAll('d3-tip').remove();
        var svg = d3.select(that.container[0]).append('svg')
            .attr('width', width)
            .attr('height', options.height)
            .append('g')
            .attr('transform', ' translate(' + width * 0.18 + ', 30)');
        var tip = d3.behavior.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0]);
        svg.call(tip);
        d3.json(chinaPath, function(error, root) {
            var path, backColor;
            if (error)
                return console.error(error);
            else {
                var zoomScale = that.getZoomScale(root.features, width, options.height);
                var projection = d3.geo.mercator()
                    .center([107, 38])
                    .scale(zoomScale*41)
                    .translate([width/3, options.height/2.5]);
                path = d3.geo.path().projection(projection);
            }
            svg.selectAll(".pathChina")
                .data(function(){
                    return root.features;
                })
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "pathChina")
                .attr("stroke","#000")
                .attr("stroke-width", 0.3)
                .attr("fill", function(d){
                    var nameNode = d.properties.name;
                    return that.fillColor(options.data, nameNode);
                })
                .on("mouseover", function(d){
                    var overColor = "#99CC00";
                    var nameNode = d.properties.name;
                    backColor = d3.select(this).attr("fill");
                    d3.select(this)
                        .attr("fill", overColor);
                    var tipString = that.tipData(options.data, nameNode) ? that.tipData(options.data, nameNode) : nameNode;
                    tip.html(tipString);
                    tip.show();
                })
                .on("mouseout", function(){
                    d3.select(this)
                        .attr("fill",backColor);
                    tip.hide();
                })
                .on("click",function(d){
                    var id = d.properties.id;
                    d3.selectAll(".pathProvince").remove();
                    d3.selectAll(".pathCounty").remove();
                    var pathProvince = "plugins/FineMap/mapdata/geometryProvince/" + id + ".json";
                    var argsProvince = {
                        d: d,
                        data: options.data,
                        mapPath: pathProvince,
                        svg: svg,
                        width: width,
                        height: options.height
                    };
                    that.clickMap(argsProvince);
                });
            var colorParam = {
                svg: svg,
                minColor: d3.rgb(180,227,248),
                maxColor: d3.rgb(2,112,221),
                width: width,
                height: options.height,
                contentHeader: that.tipHeader
            };
            options.data[0].length ? that.colorRange(colorParam) : null;
            // options.data[0].length ? _this.drawBubble(options.data, svg, root, projection) : null;
        });
    },
    clickMap: function(argsProvince){
        d3.selectAll(".pathChina").remove();
        d3.selectAll(".d3-tip").remove();
        d3.selectAll(".scatter").remove();
        this.drawPrivenceMap(argsProvince);
        this.backToTop(argsProvince);
    },
    drawPrivenceMap: function(argsProvince) {
        var background,
            _this = this;
        d3.json(argsProvince.mapPath, function(error, root) {
            var zoomScale = _this.getZoomScale(root.features, argsProvince.width, argsProvince.height);
            var centers = _this.getCenters(root.features);
            if (error)
                return console.error(error);
            var projection = d3.geo.mercator()
                .center(centers)
                .scale(zoomScale*40)
                .translate([argsProvince.width/3, argsProvince.height/2]);
            var path = d3.geo.path().projection(projection);
            var tip = d3.behavior.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0]);
            argsProvince.svg.call(tip);
            argsProvince.svg.selectAll(".pathProvince")
                .data(root.features).enter()
                .append("path")
                .attr("class", "pathProvince")
                .attr("stroke", "#000")
                .attr("stroke-width", 0.3)
                .attr("fill", function(d){
                    var nameNode = d.properties.name;
                    return _this.fillColor(argsProvince.data, nameNode);
                })
                .attr("d", path)
                .on("mouseover",function(d){
                    var overColor = "#99CC00";
                    var nameNode = d.properties.name;
                    background = d3.select(this).attr("fill");
                    d3.select(this)
                        .attr("fill", overColor);
                    var tipString = _this.tipData(argsProvince.data, nameNode) ? _this.tipData(argsProvince.data, nameNode) : nameNode;
                    tip.html(tipString);
                    tip.show();
                })
                .on("mouseout",function(){
                    d3.select(this)
                        .attr("fill", background);
                    tip.hide();
                })
                .on("click",function(d){
                    var argsCountry = {
                        d: d,
                        data: argsProvince.data,
                        svg: argsProvince.svg,
                        width: argsProvince.width,
                        height: argsProvince.height
                    };
                    _this.clickProvince(argsCountry);
                });
            // argsProvince.data != [] ? _this.drawBubble(argsProvince.data, argsProvince.svg, root, projection) : null;
        });
    },
    clickProvince : function(argsCountry) {
        d3.selectAll(".pathProvince").remove();
        d3.selectAll(".pathChina").remove();
        d3.selectAll(".d3-tip").remove();
        this.drawCountyMap(argsCountry);
        this.backToTop(argsCountry);
    },
    drawCountyMap : function(argsCountry) {
        var backColor;
        var _this = this;
        var id = argsCountry.d.properties.id;
        var mapPath = "plugins/FineMap/mapdata/geometryCouties/" + id + "00.json";
        d3.json(mapPath, function(error, root) {
            if (error)
                return console.error(error);
            var zoomScale = _this.getZoomScale(root.features, argsCountry.width, argsCountry.height);
            var centers = _this.getCenters(root.features);
            var projection = d3.geo.mercator()
                .center(centers)
                .scale(zoomScale*40)
                .translate([argsCountry.width/3, argsCountry.height/2]);
            var path = d3.geo.path().projection(projection);
            var tip = d3.behavior.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0]);
            argsCountry.svg.call(tip);
            argsCountry.svg.selectAll(".pathCounty")
                .data(root.features).enter()
                .append("path")
                .attr("class", "pathCounty")
                .attr("stroke","#000")
                .attr("stroke-width",0.3)
                .attr("fill", function(d){
                    var nameNode = d.properties.name;
                    return _this.fillColor(argsCountry.data, nameNode);
                })
                .attr("d", path)
                .on("mouseover",function(d){
                    var overColor = "#99CC00";
                    var nameNode = d.properties.name;
                    backColor = d3.select(this).attr("fill");
                    d3.select(this)
                        .attr("fill", overColor);
                    var tipString =  _this.tipData(argsCountry.data, nameNode) ? _this.tipData(argsCountry.data, nameNode) : nameNode;
                    tip.html(tipString);
                    tip.show();
                })
                .on("mouseout",function(){
                    d3.select(this)
                        .attr("fill", backColor);
                    tip.hide();
                })
            .on("click",function(){
                var countryObj = {
                    svg: argsCountry.svg,
                    data: argsCountry.data,
                    height: argsCountry.height,
                    width: argsCountry.width
                };
                _this.clickCounty(countryObj);
            });
            // argsCountry.data != [] ? _this.drawBubble(argsCountry.data, argsCountry.svg, root, projection) : null;
        });
    },
    clickCounty : function(countryData){
        d3.selectAll(".pathProvince").remove();
        d3.selectAll(".pathCounty").remove();
        d3.selectAll(".d3-tip").remove();
        var chinaJsonPath = "plugins/map/mapdata/china.json";
        var argsChina = {
            mapPath: chinaJsonPath,
            data: countryData.data,
            svg: countryData.svg,
            width: countryData.width,
            height: countryData.height
        };
        this.map(argsChina);
    },
    drawBubble: function(data, svg, root, projection){
        var rowHeaderLength = 0,
            columnHeaderLength = 0,
            columnHeaderLink = [],
            columnMax,
            columnMin,
            columnList = [];
        data ? data[0].map(function(d){
            d.property == 'header_empty' ? rowHeaderLength++ : null;
        }) : null;
        data.map(function (d) {
            d[0] ? (d[0].property == 'header_empty' ? columnHeaderLength++ : null) : null;
        });
        for (var n = rowHeaderLength; n < data[rowHeaderLength].length; n++) {
            var title = [];
            for (var m = 0; m < columnHeaderLength + 1; m++) {
                title.push(data[m][n].data);
            }
            columnHeaderLink.push(title.join('-'));
        }
        if (data[0].length) {
            for (var i = columnHeaderLength + 1; i < data.length; i++) {
                (data[i][rowHeaderLength].data == "N/A" ?  columnList.push(0) :
                    columnList.push(parseInt(data[i][rowHeaderLength].data)));
            }
        }
        columnMax = d3.max(columnList);
        columnMin = d3.min(columnList);
        var paraNumber = d3.scale.linear()
            .domain([columnMin, columnMax])
            .range([0, 1]);
        var tip = d3.behavior.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0]);
        svg.call(tip);
        root.features.forEach(function (r) {
            for (var i = 0; i < data.length; i++) {
                if (data[0].length && (r.properties.name == data[i][rowHeaderLength - 1].data)) {
                    var radius;
                    if (data[i][rowHeaderLength].data > 0) {
                        var computeValue = d3.interpolate(2,10);
                        var t = paraNumber(data[i][rowHeaderLength].data);
                        radius = computeValue(t);
                    }
                    else {
                        radius = 4;
                    }
                    var proLocation = projection(r.properties.cp);
                    svg.append("circle")
                        .attr("class", "scatter")
                        .attr("fill", '#009933')
                        .attr("r", radius)
                        .attr("cx", proLocation[0])
                        .attr("cy", proLocation[1])
                        .style("cursor", "pointer")
                        .on("mouseover",function () {
                            d3.select(this)
                                .attr("stroke","#449D44");
                            var tipsName = r.properties.name,
                                tipsArray = [];
                            tip.html(function(){
                                for (var k = 0; k < data.length; k++) {
                                    if (data[k][rowHeaderLength - 1].data == r.properties.name) {
                                        for(var t = 0;t < columnHeaderLink.length;t++){
                                            var saveHeader = [],
                                                headerStr = [];
                                            saveHeader.push(columnHeaderLink[t]);
                                            saveHeader.push(data[k][t + rowHeaderLength].data);
                                            headerStr = saveHeader.join(" : ");
                                            tipsArray.push(headerStr);
                                        }
                                        return tipsName+" :</br>"+tipsArray.join("</br>");
                                    }
                                }
                            });
                            tip.show();
                        })
                        .on("mouseout",function(){
                            d3.select(this)
                                .attr("stroke","none");
                            tip.hide();
                        })
                }
            }
        });
    }
};