/**
 * Created by Fine on 2017/2/12.
 */
'user strict';

cBoard.controller('freeLayoutCtrl', function($rootScope, $scope, $http, ModalUtils, $timeout, $stateParams,
                                             $filter, freeLayoutService, chartService){

    freeLayoutService.widgetData().then(data=>{
        let dataFolders = [];

        data.map(d=>{
            let folder = d.categoryName.split('/');

            dataFolders.push(loopData(folder, d));
        });
        return dataFolders;
    })
    // .then(data=> uniqueTree(data))
    .then(data=> $scope.dataTree = data)
    .catch(e=> console.log(e));

    let loopData = function (arr, file) {
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
    // let uniqueTree = function (arr) {
    //     // console.log(arr);
    //     for (let i = 0, l = arr.length; i < l; i++) {
    //         let filePath = arr[i].path;
    //         let nextPath = i + 1 < l ? arr[i + 1].path : null;
    //         let nextName = i + 1 < l ? arr[i + 1].name : null;
    //
    //         if (filePath + arr[i].name == nextPath + nextName) {
    //             arr[i + 1].children = arr[i + 1].children ? arr[i + 1].children.concat(arr[i].children) : arr[i].children;
    //             arr[i] = {};
    //             if (arr[i + 1].children && arr[i + 1].children.length > 1) {
    //                 uniqueTree(arr[i + 1].children);
    //             }
    //         }
    //         else if (filePath === nextPath && arr[i].path != '/') {
    //             // console.log(arr[i + 1].children);
    //             arr[i + 1].children = arr[i + 1].children ? arr[i + 1].children.concat(arr[i].children) : arr[i].children;
    //             arr[i] = {};
    //             if (arr[i + 1].children && arr[i + 1].children.length > 1) {
    //                 uniqueTree(arr[i + 1].children);
    //             }
    //         }
    //     }
    //     // arr.map((d, i)=>{
    //     //     !d.name ? arr.splice(i, 1) : null;
    //     // });
    //     return arr;
    // };

    $(window).resize(function () {
        freeLayoutService.setHeight();
    });

    freeLayoutService.setHeight();
    
    $scope.switchLayout = function () {
        $rootScope.freeLayout = false;
    };

    freeLayoutService.widgetDrag($('.layoutPanel'), $scope, chartService);
});