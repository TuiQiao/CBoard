/**
 * Created by yfyuan on 2017/02/16.
 */
cBoard.controller('mailJobCtrl', function ($scope, $uibModalInstance, $http, $filter) {
    var translate = $filter('translate');
    $scope.boardType = [{name: 'Xls', type: 'xls'}, {name: 'Image', type: 'img'}, {name: 'Both', type: 'xls,img'}];

    var init = function () {
        if (!$scope.$parent.job.config) {
            $scope.config = {boards: []};
        }else{
            $scope.config = angular.copy($scope.$parent.job.config);
        }
    }();
    var getBoardList = function () {
        $http.get("dashboard/getBoardList.do").success(function (response) {
            $scope.boardList = response;
        });
    }();

    $scope.addBoard = function () {
        $scope.config.boards.push({id: $scope.boardList[0].id, type: 'img'});
    };

    $scope.boardGroup = function (item) {
        return item.categoryName ? item.categoryName : translate('CONFIG.DASHBOARD.MY_DASHBOARD');
    };

    $scope.close = function () {
        $uibModalInstance.close();
    };
    $scope.ok = function () {
        $scope.$parent.job.config = $scope.config;
        $uibModalInstance.close();
    };

});