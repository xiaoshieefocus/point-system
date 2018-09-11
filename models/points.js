var db = require('../lib/db'),
    logger = require('../lib/logger').logger,
    points = {};

points.get = function (id, callback) {
	var q = 'select * from point_logs';
	db.executeQuery(q,[], callback);
};

module.exports = points;