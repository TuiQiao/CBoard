/**
 * Created by yfyuan on 2016/8/26.
 */

cBoard.service('ModalUtils', function ($uibModal, $filter) {

    var translate = $filter('translate');

    this.alert = function (content, style, size, callback) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/util/modal/alert.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            windowClass: style,
            size: size,
            controller: function ($scope, $uibModalInstance) {
                content ? $scope.content = content : $scope.content = translate('CONFIG.DASHBOARD.DASHBOARD_SOMETHING_WRONG');
                $scope.ok = function () {
                    $uibModalInstance.close();
                    if (callback) {
                        callback();
                    }
                };
            }
        });
    };

    this.confirm = function (content, style, size, ok, close) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/util/modal/confirm.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            windowClass: style,
            size: size,
            controller: function ($scope, $uibModalInstance) {
                content ? $scope.content = content : $scope.content = translate('CONFIG.DASHBOARD.DASHBOARD_SOMETHING_WRONG');
                $scope.ok = function () {
                    $uibModalInstance.close();
                    if (ok) {
                        ok();
                    }
                };
                $scope.close = function () {
                    $uibModalInstance.close();
                    if (close) {
                        close();
                    }
                };
            }
        });
    };

});