/**
 * Created by yfyuan on 2017/02/16.
 */
cBoard.controller('jobCtrl', function ($scope, $http, dataService, $uibModal, ModalUtils, $filter, chartService, $timeout) {
    var translate = $filter('translate');

    $scope.new = function () {
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/job/edit.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            controller: function ($scope, $uibModalInstance) {
                $scope.cronConfig = {
                    quartz: true,
                    options: {
                        allowYear: false
                    }
                };
                $scope.jobTypes = [{name: 'Send Mail', type: 'mail'}];
                $scope.job = {};
                $scope.job.jobType = 'mail';
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.ok = function () {
                    $uibModalInstance.close();
                };
                $scope.config = function () {
                    $uibModal.open({
                        templateUrl: 'org/cboard/view/config/modal/job/' + $scope.job.jobType + '.html',
                        windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                        backdrop: false,
                        size: 'lg',
                        scope: $scope,
                        controller: $scope.job.jobType + 'JobCtrl'
                    });
                }
            }
        });
    };
});