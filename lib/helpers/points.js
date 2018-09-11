var pointsModel = require('../../models/points'),
    pointsHelper = {};

pointsHelper.changePoints = function (point, callback) {
    if (!point || !point.change_points || !point.user_id || !point.actions) {
        callback('miss some params for chagePoint');
    } else {
        if (!point.created) {
            point.created = new Date();
        }
        pointsModel.create('point_logs', point, callback);
    }
};

module.exports = pointsHelper;
