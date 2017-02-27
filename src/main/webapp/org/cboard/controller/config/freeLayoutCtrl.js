/**
 * Created by Fine on 2017/2/12.
 */
'user strict';
cBoard.controller('freeLayoutCtrl', function($rootScope, $scope, $http, ModalUtils, $timeout, $stateParams,
                                             $filter, freeLayoutService, chartService){
    var treeID = 'widgetTreeID';
    var getWidgetList = function (callback) {
        $http.get("dashboard/getWidgetList.do").success(function (response) {
            $scope.widgetList = response;
            var originalData = jstree_CvtVPath2TreeData(
                $scope.widgetList.map(function (w) {
                    return {
                        "id": w.id,
                        "name": w.name,
                        "categoryName": w.categoryName
                    };
                })
            );
            if (callback) {
                callback();
            }
            jstree_ReloadTree(treeID, originalData);
        });
    };

    var getCategoryList = function () {
        $http.get("dashboard/getWidgetCategoryList.do").success(function (response) {
            $scope.categoryList = response;
            $("#widgetName").autocomplete({
                source: $scope.categoryList
            });
        });
    };

    $(window).resize(function () {
        freeLayoutService.setHeight();
    });

    freeLayoutService.setHeight();

    $http.get("dashboard/getDatasourceList.do").success(function (response) {
        $scope.datasourceList = response;
        getCategoryList();
        getWidgetList(function () {
            if ($stateParams.id) {
                $scope.editWgt(_.find($scope.widgetList, function (w) {
                    return w.id == $stateParams.id;
                }));
            }
        });
    });

    var widgetTreeConfig = angular.copy(jsTreeConfig1);
    widgetTreeConfig.core.check_callback = function(operation, node, node_parent, node_position, more) {
        if (operation === "move_node") {
            return false;
        }
        return true;
         //allow all other operations
    };

    $scope.treeConfig = angular.copy(widgetTreeConfig);

    $(document)
        .on('dnd_move.vakata', function (e, data) {
            // drap tips icon, ok or error
            var t = $(data.event.target);
            if (!t.closest('js-tree').length) {
                if (t.closest('.layoutPanel').length) {
                    data.helper.find('.jstree-icon').removeClass('jstree-er').addClass('jstree-ok');
                }
                else {
                    data.helper.find('.jstree-icon').removeClass('jstree-ok').addClass('jstree-er');
                }
            }
        })
        .on('dnd_stop.vakata', function (e, data) {
            var t = $(data.event.target);
            if (!t.closest('js-tree').length) {
                if (t.closest('.layoutPanel').length) {
                    $(data.element).clone().appendTo(t.closest('.drop'));
                    // node data:
                    console.log(data.data.origin.get_node(data.element));
                    // if(data.data.jstree && data.data.origin) { console.log(data.data.origin.get_node(data.element); }

                }
            }
        });


    $scope.applyModelChanges = function () {
        return !$scope.ignoreChanges;
    };

    $scope.treeEventsObj = {
        activate_node: function(obj, e) {
            var myJsTree = jstree_GetWholeTree(treeID);
            var data = myJsTree.get_selected(true)[0];
            if (data.children.length > 0) {
                myJsTree.deselect_node(data);
                myJsTree.toggle_node(data);
            }
        },
        dragstart: function (e) {
            e.originalEvent.dataTransfer.effectAllowed = "move";
            var myJsTree = jstree_GetWholeTree(treeID);
            var data = JSON.stringify(myJsTree.get_selected(true)[0]);
            e.originalEvent.dataTransfer.setData('Text', data);
        }
    };
    
    $scope.switchLayout = function () {
        $rootScope.freeLayout = false;
    };

    freeLayoutService.widgetDrag($('.layoutPanel'), $scope, chartService);
});