Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

/*hexDataV数据可视化全局变量*/
var hexDataV = {
    defaultTitle: '我是标题数据',
    defaultTitleColor: '#FFFFFF',
    defaultBgColor: 'none',
    defaultDateFormat: 'yyyy-MM-dd hh:mm:ss',
    defaultFontSize: 12,
    defaultFontWeight: 'normal'
};

/**
 * 图表分组数据legend
 *
 * @param array
 * @param gField
 * @returns {any[]}
 */
hexDataV.legendData = function (array, gField) {
    if (!gField) {
        gField = 'g';
    }

    var data = _.groupBy(array, function (each) {
        return each[gField];
    });

    return _.keys(data);
};

/**
 * 获取X坐标数据
 *
 * @param array
 * @param xField
 * @returns {any[]}
 */
hexDataV.xData = function (array, xField) {
    if (!xField) {
        xField = 'x';
    }

    var xData = new Array();
    for (var i = 0; i < array.length; i++) {
        var data = array[i][xField];
        if (!_.contains(xData, data)) {
            xData.push(data);
        }
    }

    return xData;
};

/**
 * 获取Y坐标数据
 *
 * @param array
 * @param gField
 * @param yField
 * @returns {any[]}
 */
hexDataV.yData = function (array, gField, yField) {
    if (!yField) {
        yField = 'y';
    }

    if (!gField) {
        gField = 'g';
    }

    var data = _.groupBy(array, function (each) {
        return each[gField];
    });
    var keys = _.keys(data);
    for (var index = 0; index < keys.length; index++) {
        var key = keys[index];
        var array = data[key];
        var yData = new Array();
        for (var i = 0; i < array.length; i++) {
            yData.push(array[i][yField]);
        }
        data[key] = yData;
    }
    return data;
};

/**
 * 饼图数据
 *
 * @param array
 * @param gField
 * @param yField
 * @returns {any[]}
 */
hexDataV.getPieData = function (array, gField, yField) {
    if (!yField) {
        yField = 'y';
    }
    if (!gField) {
        gField = 'g';
    }

    var yData = new Array();
    for (var i = 0; i < array.length; i++) {
        var row = array[i];
        yData.push({value: row[yField], name: row[gField]});
    }
    return yData;
};

/**
 * 初始化饼图
 *
 * @param domId
 * @param color
 * @param legend
 * @param name
 * @param data
 */
hexDataV.initPie = function (chartConf, legend, name, data) {
    var pieChart = document.getElementById(chartConf.chartId);
    var option = {
        title: {
            text: chartConf.chartTitle,
            x: 'center',
            textStyle: {
                color: "#FFF",
                fontSize: 12,
            }
        },
        //color:color,
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data: legend,
            textStyle: {
                color: '#FFFFFF'
            }
        },
        series: [
            {
                name: name,
                type: 'pie',
                radius: '55%',
                center: ['60%', '60%'],
                data: data,
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                label: {
                    normal: {
                        show: true,
                        formatter: '{b}'
                    },
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: '#FFFFFF'
                    }
                }
            }
        ]
    };

    var chart = echarts.init(pieChart);
    chart.setOption(option);
    $('#' + chartConf.chartId).resize(function (e) {
        chart.resize();
    });
};

/*hexDataV数据可视化组件信息*/
hexDataV.component = {
    'label': 'hex-datav-label', 'kpi': 'hex-datav-kpi', 'clock': 'hex-datav-clock',
    'table': 'hex-datav-table', 'border': 'hex-datav-border','chart':'hex-datav-chart'
};

/*hexDataV数据可视化组件icon*/
hexDataV.componentICON = {
    'bar': {icon: 'fa fa-bar-chart', title: '柱状图'}, 'line': {icon: 'fa fa-line-chart', title: '折线图'},
    'pie': {icon: 'fa fa-pie-chart', title: '饼图'}, 'label': {icon: 'fa fa-language', title: '标题'},
    'kpi': {icon: 'fa fa-credit-card', title: '标题'}, 'clock': {icon: 'fa fa-clock-o', title: '时钟'},
    'table': {icon: 'fa fa-table', title: '表格'}, 'border': {icon: 'fa fa-square-o', title: '边框'},
    'list': {icon: 'fa fa-server', title: '轮播列表'}
};

/*坐标样式*/
/*hexDataV.zoomStyle = function (dataVChartConf, chartStyle) {
    var zoomStyle = {};
    var xField = dataVChartConf.xField ? dataVChartConf.xField : 'x';
    var yField = dataVChartConf.yField ? dataVChartConf.yField : 'y';
    if (!chartStyle) {
        chartStyle = '{}';
    }
    chartStyle = eval('(' + chartStyle + ')');
    zoomStyle.x = chartStyle[xField];
    zoomStyle.y = chartStyle[yField];
    return zoomStyle;
};*/

//图表分组颜色
/*hexDataV.legendStyle = function (legend, chartStyle) {
    var colors = new Array();
    if (!legend || legend.length == 0 || !chartStyle) {
        return colors;
    }

    chartStyle = eval('(' + chartStyle + ')');
    for (var i = 0; i < legend.length; i++) {
        colors.push(chartStyle[legend[i]]);
    }
    return colors;
};*/


//默认指标卡数据
hexDataV.defaultKpiData = function () {
    return "{label:'年度新增规模', value:'5000亿'}";
};

//默认指标卡样式
hexDataV.defaultKpiStyle = function () {
    return {
        labelFontSize: 14, labelFontWeight: 'normal', labelColor: '#03A2C9', labelBgColor: '#0b375a',
        textFontSize: 12, textFontWeight: 'normal', textColor: '#5CFFAC', textBgColor: '#0b375a'
    };
};

//默认时钟样式
hexDataV.defaultClockStyle = function () {
    return {
        labelFontSize: '12', labelColor: '#FFFFFF', labelPadding: '5',
        textFontSize: '12', textFontWeight: 'normal', textColor: '#FFFFFF', textFormat: hexDataV.defaultDateFormat
    };
};

//默认表格数据
hexDataV.defaultTableData = function () {
    return "[{label:'支持两种数据格式', value:'这是第一种'}, {'key0':'这是第二种', 'key1':'value1', 'key2':'value2', 'key3':'value3'}]";
};

//默认表格样式
hexDataV.defaultTableStyle = function () {
    return {
        labelFontSize: 12,
        labelFontWeight: 'normal',
        labelColor: '#03A2C9',
        labelAlign: 'left',
        textFontSize: 12,
        textFontWeight: 'normal',
        textColor: '#5CFFAC',
        textAlign: 'left',
        rowBorderWidth: 1,
        rowBorderColor: '#57D2FE',
        oddRowBgColor: '#631616',
        evenRowBgColor: '#333333',
        colBorderWidth: 1,
        colBorderColor: '#57D2FE',
        headFontSize: 14,
        headColor: '#FFFFFF',
        headFontWeight: 'normal',
        headBgColor: 'none'
    };
};

//获取边框组件样式
hexDataV.getBorderStyle = function (basePath) {
    var borderStyle = new Array();
    for (var i = 1; i <= 11; i++) {
        var key = '框' + i;
        var value = (basePath ? basePath : '') + '/cboard/org/cboard/view/config/board/datav/img/border/' + (i < 10 ? '0' + i : i) + '.png';
        value = 'url(' + value + ')';
        borderStyle.push({key: key, value: value})
    }
    return borderStyle;
};


/**
 * hexDataV数据可视化的图表文本对齐方式
 *
 * @returns {*[]}
 */
hexDataV.textAlign = function () {
    return [{text: '居左', value: 'left'}, {text: '居中', value: 'center'}, {text: '居右', value: 'right'}];
};

//设置字体的粗细
hexDataV.getFontWeight = function () {
    var fontWeight = new Array();
    fontWeight.push({key: 'normal', value: 'normal'});
    fontWeight.push({key: 'bold', value: 'bold'});
    fontWeight.push({key: 'bolder', value: 'bolder'});
    fontWeight.push({key: 'lighter', value: 'lighter'});
    for (var i = 100; i < 1000;) {
        fontWeight.push({key: i, value: i});
        i += 100;
    }
    return fontWeight;
};

/**
 * hexDataV数据可视化的图表数据源类型
 *
 * @returns {*[]}
 */
hexDataV.dataSource = function () {
    return [{'text': '静态数据', 'value': '01'}, {'text': 'API', 'value': '02'}, {'text': '数据库', 'value': '03'}];
};

/*表格组件*/
Vue.component('hex-datav-table', {
    props: {
        chartdata: Object
    },
    template: '<div class="datav-table">' +
    '<table cellspacing="0" cellpadding="0">' +
    '<tr>' +
    '<td v-bind:style=" {color:chartdata.dataVConfChartCSS.headColor,fontSize:chartdata.dataVConfChartCSS.headFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.headFontWeight,background:chartdata.dataVConfChartCSS.headBgColor,textAlign:\'center\',borderRightStyle:\'solid\',borderRightColor:chartdata.dataVConfChartCSS.colBorderColor,borderRightWidth:chartdata.dataVConfChartCSS.colBorderWidth + \'px\'} ">{{data.head.label}}</td>' +
    '<td v-bind:style=" {color:chartdata.dataVConfChartCSS.headColor,fontSize:chartdata.dataVConfChartCSS.headFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.headFontWeight,background:chartdata.dataVConfChartCSS.headBgColor,textAlign:\'center\'} ">{{data.head.value}}</td>' +
    '</tr>' +
    '<tr v-for="(key, index) in _.keys(data.body)" ' +
    'v-bind:style=" {background:(index+1)%2==0?chartdata.dataVConfChartCSS.evenRowBgColor:chartdata.dataVConfChartCSS.oddRowBgColor,borderBottomStyle:\'solid\',borderBottomColor:(index+1<_.keys(data.body).length?chartdata.dataVConfChartCSS.rowBorderColor:\'\'),borderBottomWidth:(index+1<_.keys(data.body).length?(chartdata.dataVConfChartCSS.rowBorderWidth  + \'px\'):\'0px\')} ">' +
    '<td class="datav-table-body" v-bind:style=" {textAlign:chartdata.dataVConfChartCSS.labelAlign,borderRightStyle:\'solid\',borderRightColor:chartdata.dataVConfChartCSS.colBorderColor,borderRightWidth:chartdata.dataVConfChartCSS.colBorderWidth + \'px\'} ">' +
    '<label v-bind:style=" {color:chartdata.dataVConfChartCSS.labelColor,fontSize:chartdata.dataVConfChartCSS.labelFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.labelFontWeight} ">{{key}}</label>' +
    '</td>' +
    '<td class="datav-table-body" v-bind:style=" {textAlign:chartdata.dataVConfChartCSS.textAlign} ">' +
    '<label v-bind:style=" {color:chartdata.dataVConfChartCSS.textColor,fontSize:chartdata.dataVConfChartCSS.textFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.textFontWeight} ">{{data.body[key]}}</label>' +
    '</td>' +
    '</tr>' +
    '</table>' +
    '</div>',
    data: function () {
        return {data: {head: {label: '', value: ''}, body: []}};
    },
    methods: {
        init: function () {
            //图表渲染数据
            var jsonData = this.chartdata.jsonData;
            if (jsonData) {
                var tableData = eval('(' + jsonData + ')');
                var head = tableData[0];
                if (head) {
                    var labelField = this.chartdata.xField;
                    var valueField = this.chartdata.yField;
                    labelField = labelField ? labelField : 'label';
                    valueField = valueField ? valueField : 'value';
                    this.data.head = {label: head[labelField], value: head[valueField]};
                }
                this.data.body = tableData[1];
            }
        }
    },
    mounted: function () {
        //渲染饼图
        this.init();
    },
    watch: {'chartdata.jsonData': 'init', 'chartdata.xField': 'init', 'chartdata.yField': 'init'}
});

//创建组件
Vue.component('hex-datav-clock', {
    props: {
        chartdata: Object
    },
    template: '<div class="datav-clock">' +
    '               <table cellpadding="0" cellspacing="0" style="width: 100%;height: 100%;">' +
    '                   <tr>' +
    '                       <td>' +
    '                           <i class="fa fa-clock-o" aria-hidden="true" v-bind:style=" {color:chartdata.dataVConfChartCSS.labelColor,fontSize:chartdata.dataVConfChartCSS.labelFontSize + \'px\',paddingRight:chartdata.dataVConfChartCSS.labelPadding + \'px\'} "></i>' +
    '                           <label v-bind:style=" {color:chartdata.dataVConfChartCSS.textColor,fontSize:chartdata.dataVConfChartCSS.textFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.textFontWeight} ">{{currentDate}}</label>' +
    '                       </td>' +
    '                   </tr>' +
    '               </table>' +
    '           </div>',
    data: function () {
        return {currentDate: ''}
    },
    methods: {
        init: function () {
            //日期格式化样式
            this.currentDate = new Date().format(this.chartdata.dataVConfChartCSS.textFormat);
            var _this = this;
            setInterval(function () {
                _this.currentDate = new Date().format(_this.chartdata.dataVConfChartCSS.textFormat);
            }, 1000);
        }
    },
    mounted: function () {
        this.init();
    },
    watch: {'chartdata.dataVConfChartCSS.textFormat': 'init'}
})

/*文本标题*/
Vue.component('hex-datav-label', {
    props: {
        chartdata: Object
    },
    template: '<div class="datav-label">' +
    '<table cellspacing="0" cellpadding="0">' +
    '<tr><td class="datav-label-label" v-bind:style=" {color:chartdata.dataVConfChartCSS.titleColor,background:chartdata.dataVConfChartCSS.bgColor,fontSize:chartdata.dataVConfChartCSS.titleFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.titleFontWeight} ">{{chartdata.dataVConfChartCSS.chartTitle}}</td></tr>' +
    '</table>' +
    '</div>'
});

/*指标卡*/
Vue.component('hex-datav-kpi', {
    props: {
        chartdata: Object
    },
    template: '<div class="datav-kpi">' +
    '<table cellspacing="0" cellpadding="0">' +
    '<tr><td class="datav-kpi-label" v-bind:style=" {color:chartdata.dataVConfChartCSS.labelColor,background:chartdata.dataVConfChartCSS.labelBgColor,fontSize:chartdata.dataVConfChartCSS.labelFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.labelFontWeight} ">{{label}}</td></tr>' +
    '<tr><td class="datav-kpi-number" v-bind:style=" {color:chartdata.dataVConfChartCSS.textColor,background:chartdata.dataVConfChartCSS.textBgColor,fontSize:chartdata.dataVConfChartCSS.textFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.textFontWeight} ">{{value}}</td></tr>' +
    '</table>' +
    '</div>',
    data: function () {
        //表格渲染数据
        var result = {label: '', value: ''};
        var jsonData = this.chartdata.jsonData;
        if (jsonData) {
            var kpiData = eval('(' + jsonData + ')');
            var labelFiled = this.chartdata.xField;
            var valueFiles = this.chartdata.yField;
            labelFiled = labelFiled ? labelFiled : 'label';
            valueFiles = valueFiles ? valueFiles : 'value';
            result.label = kpiData[labelFiled];
            result.value = kpiData[valueFiles];
        }
        return result;
    },
    methods: {
        init: function () {
            //图表渲染数据
            var jsonData = this.chartdata.jsonData;
            if (jsonData) {
                var kpiData = eval('(' + jsonData + ')');
                var labelFiled = this.chartdata.xField;
                var valueFiles = this.chartdata.yField;
                labelFiled = labelFiled ? labelFiled : 'label';
                valueFiles = valueFiles ? valueFiles : 'value';
                this.label = kpiData[labelFiled];
                this.value = kpiData[valueFiles];
            }
        }
    },
    mounted: function () {
        //渲染饼图
        this.init();
    },
    watch: {'chartdata.jsonData': 'init', 'chartdata.xField': 'init', 'chartdata.yField': 'init'}
});

/*DataV组件图标*/
Vue.component('hex-datav-icon', {
    props: {
        iconCls: String,
        titleName: String
    },
    template: '<div><el-tooltip class="item" effect="dark" :content="titleName" placement="bottom">' +
    '<i :class="iconCls"></i><span slot="title">{{titleName}}</span>' +
    '</el-tooltip></div>'
});

/*
/!*DataV组件图片*!/
Vue.component('hex-datav-icon-img', {
    props:{
        basePath:String,
        type:String,
        componentName:String
    },
    template:'<img class="datav-temp" :type="type" :componentName="componentName" :src=" \'/cboard/org/cboard/view/config/board/datav/img/temp/\' + type + \'.png\'" draggable="true" @dragstart="drag($event)"/>',
    methods:{
        drag:function(event){
            var current = event.currentTarget;
            var type = current.getAttribute('type');
            var componentName = current.getAttribute('componentName');
            //若组件类型以及组件名称为空
            if(!type || !componentName){
                return;
            }
            var componentDom = {type:type, componentName:componentName};
            hexDataV.componentDom = componentDom;
        }
    }
});
*/


/*边框组件*/
Vue.component('hex-datav-border', {
    props: {
        chartdata: Object
    },
    template: '<div class="datav-border" v-bind:style=" {borderImageSource:chartdata.chartStyle,boxSizing:\'border-box\'}"></div>',
    data: function () {
        return this.chartdata;
    }
});

/*分割线*/
Vue.component('hex-datav-splitline', {
    template: '<div style="width: 100%;height: 1px;border-bottom: 1px #c0c0c0 solid;margin-bottom: 5px;"></div>'
});

/*
*
*   <div class="datav-bar" v-bind:style=" {background:chartdata.bgColor} ">
*       <div :id="chartdata.domId + '_01'" style="width: 100%;height: 100%;">
*       </div>
*   </div>
* */