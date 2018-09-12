var db = require('../lib/db'),
    logger = require('../lib/logger').logger,
    moment = require('moment'),
    config = require('../configs/global/config'),
    pointsLogsBreakdown = {};

pointsLogsBreakdown.getDistributor = function (condition, callback) {
    var params = [],
        q = '';
    if(condition.company){
        q = `SELECT * FROM point_logs_breakdown WHERE company_id = $1` ;
        params.push(condition.company);
    } else if(condition.user){
        q = `SELECT * FROM point_logs_breakdown WHERE user_id = $1` ;
        params.push(condition.user);
    }
    db.executeQuery(q, params, function (err, data){
        data.forEach(function(item){
            ;
        });
        callback(err, data);
    });
};


module.exports = pointsLogsBreakdown;