/**
 * Created by Fine on 2017/2/12.
 */
'user strict';

cBoard.controller('freeLayoutCtrl', function($rootScope, $scope, $http, ModalUtils, $timeout, $stateParams,
                                             $filter, freeLayoutService, chartService){
    $http.get("dashboard/getWidgetList.do").success(function (response) {
        $scope.widgetList = response;
        let dataFolders = [];

        response.map(d=>{
           let folder = d.categoryName.split('/');

            dataFolders.push(loop(folder, d));
        });
        $scope.dataTree = dataFolders;
    });
    let loop = function (arr, file) {
        let map = {
                name: file.name,
                data: file.data,
                path: '/' + file.categoryName,
                folder: false
            },
            tmp;

        while (tmp = arr.pop()){
            let obj = {};

            obj.name = tmp;
            obj.path = '/' + file.categoryName.split(tmp)[0];
            obj.folder = true;
            obj.children = [];
            obj.children.push(map);
            map = obj;
        }
        return map;
    };

    let uniqueTree = function (data) {

    };
    // let uniqueTree = function (arr) {
    //     let hashTable = {};
    //     let data = [];
    //     for (let i = 0; i < arr.length; i++) {
    //         let name = arr[i].name;
    //
    //         arr[i].name = [name];
    //         if (!hashTable[arr[i].categoryName]) {
    //             hashTable[arr[i].categoryName] = true;
    //             data.push(arr[i]);
    //         }
    //         else {
    //             for (let j = 0; j < data.length; j++) {
    //                 let categoryName = data[j].categoryName;
    //
    //                 if (categoryName === arr[i].categoryName) {
    //                     data[j].name.push(arr[i].name[0]);
    //                 }
    //             }
    //         }
    //     }
    //     console.log(data);
    //     return data
    // };

    $(window).resize(function () {
        freeLayoutService.setHeight();
    });

    freeLayoutService.setHeight();

    // $scope.dataTree = files.children;
    
    $scope.switchLayout = function () {
        $rootScope.freeLayout = false;
    };

    freeLayoutService.widgetDrag($('.layoutPanel'), $scope, chartService);
});