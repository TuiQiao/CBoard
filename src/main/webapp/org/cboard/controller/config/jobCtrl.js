/**
 * Created by yfyuan on 2017/02/16.
 */
cBoard.controller('jobCtrl', function ($scope, $rootScope, $http, dataService, $uibModal, ModalUtils, $filter, $interval) {
    var translate = $filter('translate');

    $scope.jobTypes = [{name: 'Send Mail', type: 'mail'}];
    $scope.colorArray = ['#5d9fe6','#9fc173','#a789c7','#e88b8a','#f5d451','#ecb44d','#aee8f4','#7272af','#7c8798',
        '#90c3c6','#bc7676','#8b9bc7','#c189ba','#bb8cf2'];

    $scope.interval = $interval(function () {
        $http.get("dashboard/getJobList.do").success(function (response) {
            _.each($scope.jobList, function (e) {
                var j = _.find(response, function (r) {
                    return e.id == r.id;
                });
                e.jobStatus = j.jobStatus;
                e.execLog = j.execLog;
            });
        });
    }, 5000);

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
            if (fromState.controller == 'jobCtrl') {
                $interval.cancel($scope.interval);
            }
        }
    );

    $scope.loadJobList = function () {
        $http.get("dashboard/getJobList.do").success(function (response) {
            $scope.jobList = response;
            setPage(1);
        });
    };
    $scope.loadJobList();

    $scope.getName = function (type) {
        return _.find($scope.jobTypes, function (e) {
            return e.type == type;
        }).name;
    };

    $scope.getTime = function (t) {
        if (t) {
            return moment(Number(t)).format("YYYY-MM-DD HH:mm:ss");
        } else {
            return "N/A"
        }
    };

    $scope.getDateRange = function (d) {
        if (d) {
            return moment(d.startDate).format("YYYY-MM-DD") + ' ~ ' + moment(d.endDate).format("YYYY-MM-DD");
        } else {
            return "N/A"
        }
    };

    $scope.getStatus = function (t) {
        if (t != null) {
            switch (t) {
                case 0:
                    return "CONFIG.JOB.FAIL";
                case 1:
                    return "CONFIG.JOB.FINISH";
                case 2:
                    return "CONFIG.JOB.PROCESSING";
            }
        } else {
            return "N/A"
        }
    };

    $scope.showLog = function (job) {
        ModalUtils.alert(job.execLog ? job.execLog : "N/A", null, "lg");
    };

    $scope.runJob = function (job) {
        $http.post("dashboard/execJob.do", {id: job.id}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                job.jobStatus = 2;
                // $scope.loadJobList();
            } else {
                $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
            }
        });
    };

    $scope.editJob = function (job) {
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/job/edit.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            scope: $scope,
            controller: function ($scope, $uibModalInstance) {
                $scope.cronConfig = {
                    quartz: true,
                    allowMultiple: true,
                    options: {
                        allowYear: false
                    }
                };
                $scope.dateRangeCfg = {
                    locale: {
                        format: "YYYY-MM-DD"
                    }
                };
                if (job) {
                    $scope.job = angular.copy(job);
                    $scope.job.daterange.startDate = moment($scope.job.daterange.startDate);
                    $scope.job.daterange.endDate = moment($scope.job.daterange.endDate);
                } else {
                    $scope.job = {daterange: {startDate: null, endDate: null}, jobType: 'mail'};

                }
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.ok = function () {
                    if (job) {
                        $http.post("dashboard/updateJob.do", {json: angular.toJson($scope.job)}).success(function (serviceStatus) {
                            if (serviceStatus.status == '1') {
                                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                                $scope.$parent.loadJobList();
                                $uibModalInstance.close();
                            } else {
                                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                            }
                        });
                    } else {
                        $http.post("dashboard/saveJob.do", {json: angular.toJson($scope.job)}).success(function (serviceStatus) {
                            if (serviceStatus.status == '1') {
                                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                                $scope.$parent.loadJobList();
                                $uibModalInstance.close();
                            } else {
                                //$scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                            }
                        });
                    }
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

    $scope.deleteJob = function (job) {
    	var jobName = job.name;
        ModalUtils.confirm(translate('COMMON.CONFIRM_DELETE')+jobName, 'modal-info', 'lg', function () {
            $http.post("dashboard/deleteJob.do", {id: job.id}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.loadJobList();
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        });
    };

    /*
     * Code for pagination
    */
    $scope.pageSize = 10;
    $scope.pager = {};
    $scope.setPage = setPage;
    
    
    var pageSizeArr = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 'ALL'];
    $scope.pageSizeArr = pageSizeArr;
    function setPage(page) {
        if (page < 1 || page > $scope.pager.totalPages) {
            return;
        }
        $scope.pager = getPager($scope.jobList.length, page, $scope.pageSize);
        $scope.finalJobList = $scope.jobList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
    }
    
    var changePageSize = function() {
    	if($scope.pageSize == 'ALL')
    		$scope.pageSize = $scope.jobList.length;
    	$scope.pager = getPager($scope.jobList.length, 1, $scope.pageSize);
        $scope.finalJobList = $scope.jobList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
    }
    $scope.changePageSize = changePageSize;
    
    function getPager(totalItems, currentPage, pageSize) {
        currentPage = currentPage || 1;
        var totalPages = Math.ceil(totalItems / pageSize);
        var startPage, endPage;
        if (totalPages <= 10) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
        var pages = _.range(startPage, endPage + 1);
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
});