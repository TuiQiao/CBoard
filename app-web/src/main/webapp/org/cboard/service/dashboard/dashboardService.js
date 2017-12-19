/**
 * Created by yfyuan on 2016/8/5.
 */

cBoard.service('dashboardService', function ($http) {

    this.boardData;

    this.saveWidget = function (name, datasource, config) {
        var widget = {
            name: name,
            width: 12,
            datasource: datasource,
            config: angular.copy(config)//deep
        };
        if (!this.boardData) {
            var _this = this;
            this.get(function (bData) {
                bData.rows.push({widgets: [widget]});
                _this.saveThis();
            });
        } else {
            this.boardData.rows.push({widgets: [widget]});
            this.saveThis();
        }
    };

    this.saveThis = function () {
        $http.post("dashboard/saveData.do", {json: angular.toJson(this.boardData)}).success(function () {
        });
    };

    this.save = function (bData) {
        $http.post("dashboard/saveData.do", {json: angular.toJson(bData)}).success(function () {
        });
    };

    this.get = function (callback) {
        var _this = this;
        $http.get("dashboard/getData.do").success(function (response) {
            if (!response) {
                response = {rows: []};
            }
            _this.boardData = response;
            callback(_this.boardData);
        });
    };

});
