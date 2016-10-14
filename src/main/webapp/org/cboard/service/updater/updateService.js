/**
 * Created by yfyuan on 2016/10/14.
 */
cBoard.service('updateService', function () {
    this.updateConfig = function (config) {
        var toFilterConfig = function (e) {
            if (_.isString(e)) {
                return {col: e, type: 'eq', values: []};
            }
            return e;
        };
        config.keys = _.map(config.keys, toFilterConfig);
        config.groups = _.map(config.groups, toFilterConfig);
    };
});