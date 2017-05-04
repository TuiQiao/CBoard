/**
 * Created by yfyuan on 2017/5/2.
 */
cBoard.controller('paramSelector', function ($scope, $uibModalInstance, dataService, param, filter, getSelects, ok) {
    $scope.type = ['=', '≠', '>', '<', '≥', '≤', '(a,b]', '[a,b)', '(a,b)', '[a,b]'];
    $scope.param = param;
    $scope.operate = {};
    $scope.paramType = 'select';
    $scope.filter = filter;
    $scope.byFilter = {a: false};
    $scope.loading = true;
    $scope.getSelects = function () {
        $scope.loading = true;
        getSelects($scope.byFilter.a, $scope.param.col, function (d) {
            $scope.selects = d;
            $scope.loading = false;
        });
    };
    $scope.getSelects();
    var showValues = function () {
        var equal = ['=', '≠'];
        var openInterval = ['>', '<', '≥', '≤'];
        var closeInterval = ['(a,b]', '[a,b)', '(a,b)', '[a,b]'];
        $scope.operate.equal = $.inArray($scope.param.type, equal) > -1 ? true : false;
        $scope.operate.openInterval = $.inArray($scope.param.type, openInterval) > -1 ? true : false;
        $scope.operate.closeInterval = $.inArray($scope.param.type, closeInterval) > -1 ? true : false;
    };
    showValues();
    $scope.deleteValues = function (array) {
        if ($scope.operate.equal) {
            $scope.param.values = _.difference($scope.param.values, array);
        }
    };
    $scope.pushValues = function (array) {
        if ($scope.operate.openInterval) {
            array.splice(1, array.length - 1);
        }
        if ($scope.operate.closeInterval) {
            array.splice(2, array.length - 2);
        }
        _.each(array, function (e) {
            $scope.param.values.push(e);
        });
    };
    $scope.selected = function (v) {
        return _.indexOf($scope.param.values, v) == -1
    };
    $scope.filterType = function () {
        $scope.param.values = [];
        showValues();
    };
    $scope.close = function () {
        $uibModalInstance.close();
    };
    $scope.ok = function () {
        $uibModalInstance.close();
        ok($scope.param);
    };
});