/**
 * Created by yanjin.zhao on 2020/3/16.
 */

cBoard.service('dateSelectService', function () {

    this.executeDateSelectViewClose = function () {
        this.$broadcast('executeDateSelectViewClose');
    };

    this.changeParamValue = function (param) {
        if (!param.temp) {
            param.temp = {};
            param.temp.date_enum = param.cfg.date_enum;
            param.temp.date_range = param.cfg.date_range;
        }


        if (param.temp.date_enum) {
            param.temp.date_range = this.dateOptToValue(param.temp.date_enum);
        }

        param.temp.date_string =  param.temp.date_range;
        if (!param.temp.date_range) {
            param.values = [];
            return;
        }
        var dateFmt = param.cfg.date_fmt ? param.cfg.date_fmt : 'YYYY-MM-DD';
        var date_ranges =  param.temp.date_range.split("~");
        var date_001 = date_ranges[0].trim();
        var date_002 = date_ranges[1].trim();
        date_001 = moment(new Date(date_001)).format(dateFmt);
        date_002 = moment(new Date(date_002)).format(dateFmt);
        param.values = [date_001, date_002];
        return param;
    };

    this.dateOptToValue = function (opt) {
        //yesterday today week_last week month_last month year_last year day_7 day_30 all
        var date_value = '';
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        var date_fmt = 'YYYY-MM-DD';
        var date_e, date_s;

        switch (opt) {
            case 'yesterday':
                date_e = new Date(date.getTime());
                date_e.setHours(-24);
                date_s = new Date(date_e.getTime());
                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'today':
                date_e = new Date(date.getTime());
                date_s = new Date(date_e.getTime());
                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'week_last':
                var weekday = moment(date).weekday();
                //中国时间周 特殊处理
                if (settings.preferredLanguage === 'cn') {
                    weekday = weekday - 1;
                }
                date_e = new Date(date.getTime());
                date_e.setHours(-24 * (weekday + 1));
                date_s = new Date(date_e.getTime());
                date_s.setHours(-24 * 6);

                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'week':
                var weekday = moment(date).weekday();
                //中国时间周 特殊处理
                if (settings.preferredLanguage === 'cn') {
                    weekday = weekday - 1;
                }
                date_s = new Date(date.getTime());
                date_s.setHours(-24 * weekday);
                date_e = new Date(date_s.getTime());
                date_e.setHours(24 * 6);

                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'month_last':
                date_s = new Date(date.getTime());
                date_s.setDate(1);
                date_s.setMonth(date_s.getMonth() - 1);
                date_e = new Date(date.getTime());
                date_e.setDate(0);

                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'month':
                date_s = new Date(date.getTime());
                date_s.setDate(1);
                date_e = new Date(date.getTime());
                date_e.setDate(1);
                date_e.setMonth(date_e.getMonth() + 1);
                date_e.setDate(0);

                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'year_last':
                var year = date.getFullYear();
                date_s = new Date(date.getTime());
                date_s.setFullYear(year - 1);
                date_s.setMonth(0);
                date_s.setDate(1);
                date_e = new Date(date.getTime());
                date_e.setMonth(0);
                date_e.setDate(1);
                date_e.setHours(-24);

                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'year':
                var year = date.getFullYear();
                date_s = new Date(date.getTime());
                date_s.setMonth(0);
                date_s.setDate(1);
                date_e = new Date(date.getTime());
                date_e.setFullYear(year + 1);
                date_e.setMonth(0);
                date_e.setDate(1);
                date_e.setHours(-24);

                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'day_7':
                date_e = new Date(date.getTime());
                date_s = new Date(date_e.getTime());
                date_s.setHours(-24 * 6);

                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            case 'day_30':
                date_e = new Date(date.getTime());
                date_s = new Date(date_e.getTime());
                date_s.setHours(-24 * 29);

                date_e = moment(date_e).format(date_fmt);
                date_s = moment(date_s).format(date_fmt);
                date_value = date_s + " ~ " + date_e;
                break;
            default:
                //all

                break;
        }
        return date_value;
    };


});
