/**
 * Created by yfyuan on 2016/8/2.
 */

cBoard.controller('dashboardViewCtrl', function ($scope, $state, $stateParams, $http, ModalUtils) {

    $scope.loading = true;

    $http.get("/dashboard/getBoardData.do?id=" + $stateParams.id).success(function (response) {
        $scope.board = response;
        $scope.loading = false;
    });

    $scope.modalChart = function (widget) {
        ModalUtils.chart(widget);
    };

    $scope.config = function (widget) {
        $state.go('config.widget', {id: widget.widget.id});
    };

});