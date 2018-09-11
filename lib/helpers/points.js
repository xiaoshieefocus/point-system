var pointsModel = require('../../models/points'),
    pointsHelper = {};

pointsHelper.changePoints = function (point, callback) {
    if (!point || !point.change_points || !point.user_id || !point.actions) {
        callback('miss some params for chagePoint');
    } else {
        point.change_points = parseInt(point.change_points);
        if (!point.created) {
            point.created = new Date();
        }

        if (point.change_points < 0) {
            pointsModel.getPointsForUserId(point.user_id, function(err, userPoints) {
                if (err) {
                    callback(err);
                } else {
                    if (parseInt(userPoints.points) + point.change_points < 0) {
                        callback('not enough points');
                    } else {
                        pointsModel.create('point_logs', point, callback);
                    }
                }
            });
        } else {
            pointsModel.create('point_logs', point, callback);
        }
    }
};



module.exports = pointsHelper;
