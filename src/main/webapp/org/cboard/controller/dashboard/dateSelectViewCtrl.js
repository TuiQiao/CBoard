/**
 * Created by yanjin.zhao on 2020/3/16.
 */

cBoard.controller('dateSelectViewCtrl', function ($scope, $rootScope, dateSelectService) {
    $scope.temp = {};
    $scope.temp.show = false;

    $scope.edit = {};

    $scope.editParam = function ($event, param) {
        if ($scope.temp.show) {
            $scope.closedate($event, param);
            return;
        }

        //先关闭所有
        $scope.closeAll();

        $scope.temp.show = true;

        $scope.daterangepicker_init($event.target);

        $scope.changedate($event.target,
            $scope.param.temp.date_enum ? 1 : 2,
            $scope.param.temp.date_enum ? $scope.param.temp.date_enum : $scope.param.temp.date_range,
            true);
    };

    $scope.$on('executeDateSelectViewClose', function () {
        $scope.temp.show = false;
    });

    $scope.closeAll = function () {
        $rootScope.$broadcast('executeDateSelectViewClose');
    };

    $scope.optChange = function ($event) {
        $scope.changedate($event.target, 1, $($event.target).val());
    };

    $scope.closedate = function ($event, param) {
        $scope.edit = {};
        $scope.temp.show = false;
    };

    $scope.okdate = function ($event, param) {
        $scope.param.temp.date_enum = $scope.edit.date_enum;
        $scope.param.temp.date_range = $scope.edit.date_range;

        $scope.edit = {};
        $scope.temp.show = false;

        dateSelectService.changeParamValue(param);

        //触发刷新
        _.debounce($scope.$parent.applyParamFilter($scope.crow), 800);
    };


    $scope.changedate = function (target, type, date) {

        var pdiv = $(target).parents('.date-div');
        var range = "";
        if (type === 1) {
            $(pdiv).find(".date-opt .btn").removeClass('date-opt-select');
            var t_ = $(pdiv).find('button[value=' + date + ']');
            $(t_).addClass('date-opt-select');
            $(t_).blur();

            $scope.edit.date_enum = date;
            $scope.edit.date_range = null;

            range = dateSelectService.dateOptToValue(date);
        } else if (type === 2) {
            $(".date-opt .btn").removeClass('date-opt-select');

            $scope.edit.date_enum = null;
            $scope.edit.date_range = date;

            range = date;
        }

        if (range) {
            var date_ranges = range.split("~");
            $(pdiv).find(".c-range-picker").data('daterangepicker').setStartDate(date_ranges[0].trim());
            $(pdiv).find(".c-range-picker").data('daterangepicker').setEndDate(date_ranges[1].trim());
            $(pdiv).find(".c-range-picker").data('daterangepicker').updateView();
        } else {
            var cdate = moment(new Date()).format('YYYY-MM-DD');
            $(pdiv).find(".c-range-picker").data('daterangepicker').setStartDate(cdate);
            $(pdiv).find(".c-range-picker").data('daterangepicker').setEndDate(cdate);
            $(pdiv).find(".c-range-picker").data('daterangepicker').updateView();
        }
    };

    $scope.daterangepicker_init = function (target) {
        var pdiv = $(target).parents('.date-div');

        var $rangePicker = $(pdiv).find(".c-range-picker");
        var parentEl = $(pdiv).find(".c-range-picker-p")[0];

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
            $scope.changedate(target, 2, range);
        });
        $($rangePicker).data('daterangepicker').show();

        // console.log($($rangePicker).val());
    };

});
