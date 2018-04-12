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
    defaultFontWeight: 'normal',
    jsonData: '',
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

/*hexDataV数据可视化组件信息*/
hexDataV.component = {
    'label': 'hex-datav-label', 'kpi': 'hex-datav-kpi', 'clock': 'hex-datav-clock',
    'border': 'hex-datav-border', 'chart': 'hex-datav-chart', 'ornament': "hex-datav-ornament",
    'rlabel':'hex-datav-rlabel', 'table': 'hex-datav-table'
};

/*hexDataV数据可视化组件icon*/
hexDataV.componentICON = {
    'bar': {icon: 'fa fa-bar-chart', title: '柱状图'}, 'line': {icon: 'fa fa-line-chart', title: '折线图'},
    'pie': {icon: 'fa fa-pie-chart', title: '饼图'}, 'label': {icon: 'fa fa-language', title: '标题'},
    'kpi': {icon: 'fa fa-credit-card', title: '标题'}, 'clock': {icon: 'fa fa-clock-o', title: '时钟'},
    'border': {icon: 'fa fa-square-o', title: '边框'}, 'list': {icon: 'fa fa-server', title: '轮播列表'}
};

//默认指标卡数据
hexDataV.defaultKpiData = function () {
    return {'label': '年度新增规模', 'value': '5000亿'};
};

hexDataV.defaultRLabelData = function(){
    return {value:"HexDataV可视化产品，创造属于您的日常运营监控大屏！"};
}

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

hexDataV.defaultTableData = function(){
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
        var value = (basePath ? basePath : '') + 'imgs/datav/border/' + (i < 10 ? '0' + i : i) + '.png';
        value = 'url(' + value + ')';
        borderStyle.push({key: key, value: value})
    }
    return borderStyle;
};

/**
 * 装饰元素
 *
 * @param basePath
 * @returns {any[]}
 */
hexDataV.getOrnamentStyle = function (basePath) {
    var ornamentStyle = new Array();
    for (var i = 1; i <= 10; i++) {
        var gif = 'gif' + i;
        var value = (basePath ? basePath : '') + 'imgs/datav/ornament/' + gif + '.gif';
        ornamentStyle.push({key: gif, value: value});
    }
    return ornamentStyle;
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
        return this.chartdata.jsonData;
    },
    methods: {
        init: function () {
            //图表渲染数据
            var jsonData = this.chartdata.jsonData;
            this.label = jsonData.label;
            this.value = jsonData.value;
        }
    },
    mounted: function () {
        this.init();
    },
    watch: {'chartdata.jsonData': 'init'}
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

/*动态边框*/
Vue.component('hex-datav-ornament', {
    props: {
        chartdata: Object
    },
    template: '<div class="datav-ornament" v-bind:style=" {backgroundImage:\'url(\' + chartdata.chartStyle + \')\'} "></div>'
});

/*分割线*/
Vue.component('hex-datav-splitline', {
    template: '<div style="width: 100%;height: 1px;border-bottom: 1px #c0c0c0 solid;margin-bottom: 5px;"></div>'
});

/*滚动文本(跑马灯)*/
Vue.component('hex-datav-rlabel', {
    props: {
        chartdata: Object
    },
    template: '<div class="datav-rlabel" v-bind:style=" {color:chartdata.dataVConfChartCSS.titleColor,fontSize:chartdata.dataVConfChartCSS.titleFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.titleFontWeight} ">' +
    '<marquee scrollAmount=2>{{value}}</marquee>' +
    '</div>',
    data: function () {
        return this.chartdata.jsonData;
    },
    methods: {
        init: function () {
            var jsonData = this.chartdata.jsonData;
            this.value = jsonData.value;
        }
    },
    mounted: function () {
        this.init();
    },
    watch: {'chartdata.jsonData': 'init'}
});

/*表格组件*/
Vue.component('hex-datav-table', {
    props:{
        chartdata:Object
    },
    template:'<div class="datav-table" v-bind:style=" {borderColor:chartdata.dataVConfChartCSS.borderColor,borderWidth:chartdata.dataVConfChartCSS.borderWidth + \'px\'} ">' +
    '<table cellspacing="0" cellpadding="0">' +
    '<tr>' +
    '<td v-bind:style=" {textAlign:chartdata.dataVConfChartCSS.headAlign,color:chartdata.dataVConfChartCSS.headColor,fontSize:chartdata.dataVConfChartCSS.headFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.headFontWeight,background:handleBgColor(chartdata.dataVConfChartCSS.headBgColor),borderRightStyle:\'solid\',borderRightColor:chartdata.dataVConfChartCSS.colBorderColor,borderRightWidth:chartdata.dataVConfChartCSS.colBorderWidth + \'px\',width:chartdata.dataVConfChartCSS.widthPercentage?chartdata.dataVConfChartCSS.widthPercentage + \'%\':\'\'} ">{{data.head.label}}</td>' +
    '<td v-bind:style=" {textAlign:chartdata.dataVConfChartCSS.headAlign,color:chartdata.dataVConfChartCSS.headColor,fontSize:chartdata.dataVConfChartCSS.headFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.headFontWeight,background:handleBgColor(chartdata.dataVConfChartCSS.headBgColor)} ">{{data.head.value}}</td>' +
    '</tr>' +
    '<tr v-for="(key, index) in _.keys(data.body)" ' +
    'v-bind:style=" {background:handleBgColor((index+1)%2==0?chartdata.dataVConfChartCSS.evenRowBgColor:chartdata.dataVConfChartCSS.oddRowBgColor),borderBottomStyle:\'solid\',borderBottomColor:chartdata.dataVConfChartCSS.rowBorderColor,borderBottomWidth:(index+1<_.keys(data.body).length?(chartdata.dataVConfChartCSS.rowBorderWidth  + \'px\'):\'0px\')} ">' +
    '<td class="datav-table-body" v-bind:style=" {textAlign:chartdata.dataVConfChartCSS.labelAlign,borderRightStyle:\'solid\',borderRightColor:chartdata.dataVConfChartCSS.colBorderColor,borderRightWidth:chartdata.dataVConfChartCSS.colBorderWidth + \'px\'} ">' +
    '<label v-bind:style=" {color:chartdata.dataVConfChartCSS.labelColor,fontSize:chartdata.dataVConfChartCSS.labelFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.labelFontWeight} ">{{key}}</label>' +
    '</td>' +
    '<td class="datav-table-body" v-bind:style=" {textAlign:chartdata.dataVConfChartCSS.textAlign} ">' +
    '<label v-bind:style=" {color:chartdata.dataVConfChartCSS.textColor,fontSize:chartdata.dataVConfChartCSS.textFontSize + \'px\',fontWeight:chartdata.dataVConfChartCSS.textFontWeight} ">{{data.body[key]}}</label>' +
    '</td>' +
    '</tr>' +
    '</table>' +
    '</div>',
    data:function(){
        return {data:{head:{label:'', value:''}, body:[]}};
    },
    methods:{
        init:function(){
            //图表渲染数据
            var jsonData = this.chartdata.jsonData.value;
            if(jsonData){
                var tableData = eval('(' + jsonData + ')');
                var head = tableData[0];
                if(head){
                    var labelField = this.chartdata.xField;
                    var valueField = this.chartdata.yField;
                    labelField = labelField?labelField:'label';
                    valueField = valueField?valueField:'value';
                    this.data.head = {label:head[labelField], value:head[valueField]};
                }
                this.data.body = tableData[1];
            }
        },
        handleBgColor:function(color){
            return handleBgColor(color);
        },
        chartdataChange:function(){
            this.init();
        }
    },
    mounted:function(){
        //渲染表格
        this.init();
    },
    watch:{'chartdata.jsonData.value':'init', 'chartdata.xField':'chartdataChange', 'chartdata.yField':'chartdataChange'}
});

function handleBgColor(bgColor){
    if(!bgColor){
        return 'none';
    }

    bgColor = bgColor.toUpperCase();
    if(bgColor=='#000' || bgColor=='#000000' || bgColor=='#FFF' || bgColor=='#FFFFFF'){
        return 'none';
    }

    return bgColor;
}