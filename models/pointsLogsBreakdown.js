var db = require('../lib/db'),
    logger = require('../lib/logger').logger,
    moment = require('moment'),
    config = require('../configs/global/config'),
    pointsLogsBreakdown = {};

function changeTwoDecimal_f(x) {
    var f_x = parseFloat(x);
    if (isNaN(f_x)) {
        return false;
    }
    var f_x = Math.round(x * 100) / 100;
    var s_x = f_x.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
    }
    return s_x;
}

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
        var distributors = [],
            spend = [],
            purchase_money_saved = [];
        data.forEach(function(item){
            if(distributors.indexOf(item.distributor_name) < 0){
                distributors.push(item.distributor_name);
                purchase_money_saved.push(parseFloat(item.purchase_money_saved));
                spend.push(parseFloat(item.change_points_distributor));
            } else {
                purchase_money_saved[distributors.indexOf(item.distributor_name)] += parseFloat(item.purchase_money_saved);
                spend[distributors.indexOf(item.distributor_name)] += parseFloat(item.change_points_distributor);

            }

        });
        var result = [];
        for (var i = 0; i < purchase_money_saved.length; i++){
            var item = {
                distributor: distributors[i],
                purchase_money_saved: changeTwoDecimal_f(purchase_money_saved[i]),
                spend: changeTwoDecimal_f(spend[i])
            }
            result.push(item);
        }
        callback(err, result);
    });
};


module.exports = pointsLogsBreakdown;