var pointsModel = require('../../models/points'),
	config = require('../../configs/global/config'),
	actionPoints = config.actionPoints,
    pointsHelper = {};

pointsHelper.calculatePoints = function (action, params, callback) {
	var legalActions = Object.keys(actionPoints),
		points = 0;
	if (legalActions.indexOf(action) === -1) {
		var msg = 'points action is not defined';
		callback(true, msg);
	} else {
		var pointsRate = actionPoints[action];
		switch(action) {
			case 'bom':
				var num = params.number;
				var index = pointsRate.findIndex(item => num <= item.number);
				points = pointsRate[index].points;
				break;
			case 'purchase':
				var price = params.price;
				points = price * pointsRate;
				break;
			case 'invitation':
				points = pointsRate;
				break;
		}
		callback(null, points);
	}
};


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
