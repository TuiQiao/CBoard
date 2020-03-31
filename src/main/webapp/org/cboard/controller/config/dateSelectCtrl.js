/**
 * Created by yanjin.zhao on 2020/3/16.
 */

cBoard.controller('dateSelectCtrl', function ($scope) {

    $scope.param.type = '[a,b]';
    if (!$scope.param.cfg) {
        $scope.param.cfg = {};
    }


    $scope.ctrl_init = function () {

        $scope.daterangepicker_init();

        if ($scope.param.cfg.date_enum) {
            $scope.changedate(1, $scope.param.cfg.date_enum);
        } else if ($scope.param.cfg.date_range) {
            $scope.changedate(2, $scope.param.cfg.date_range);
        }
    };

    $scope.daterangepicker_init = function () {

        var $rangePicker = $('#range_picker_');
        var parentEl = '#range_picker_p';

        //date-range-picker
        var dateRangeCfg = {
            locale: {
                format: "YYYY-MM-DD",
                separator: ' ~ '
            },
            parentEl: parentEl,
            autoApply: true,
            linkedCalendars: false
        };
        if ($scope.param.cfg.date_range) {
            var dates = $scope.param.cfg.date_range.split("~");
            dateRangeCfg.startDate = dates[0].trim();
            dateRangeCfg.endDate = dates[1].trim();

        }

        //中国时间周 特殊处理
        if (settings.preferredLanguage === 'cn') {
            dateRangeCfg.locale.daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
            dateRangeCfg.locale.firstDay = 1;
            dateRangeCfg.locale.monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        }
        $($rangePicker).daterangepicker(dateRangeCfg);
        $($rangePicker).on('apply.daterangepicker', function (ev, picker) {
            var range = $(ev.currentTarget).val();
            console.log(range);
            $scope.changedate(2, range);
            $scope.$apply();
        });
        $($rangePicker).data('daterangepicker').show();
    };


    $(".date-opt .btn").on('click', function () {
        $scope.changedate(1, $(this).val());
        $scope.$apply();
    });

    $scope.changedate = function (type, date) {

        if (type === 1) {
            $(".date-opt .btn").removeClass('date-opt-select');
            var t_ = $('button[value=' + date + ']');
            $(t_).addClass('date-opt-select');
            $(t_).blur();

            $scope.param.cfg.date_enum = date;
            $scope.param.cfg.date_range = null;
            $scope.date_string = '';

            var cdate = moment(new Date()).format('YYYY-MM-DD');
            $('#range_picker_').data('daterangepicker').setStartDate(cdate);
            $('#range_picker_').data('daterangepicker').setEndDate(cdate);
            $('#range_picker_').data('daterangepicker').updateView();

        } else if (type === 2) {
            $(".date-opt .btn").removeClass('date-opt-select');

            $scope.param.cfg.date_enum = null;
            $scope.param.cfg.date_range = date;

            $scope.date_string = $scope.changeDateString(date);
        }

    };

    $scope.changeDateString = function (value) {
        if (!value) {
            return '';
        }
        var dateFmt = $scope.param.cfg.date_fmt ? $scope.param.cfg.date_fmt : 'YYYY-MM-DD';
        var dates = value.split("~");
        var date_001 = dates[0].trim();
        var date_002 = dates[1].trim();
        date_001 = moment(new Date(date_001)).format(dateFmt);
        date_002 = moment(new Date(date_002)).format(dateFmt);
        return date_001 + " ~ " + date_002;
    };

});
