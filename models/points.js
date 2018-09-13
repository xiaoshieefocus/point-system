var db = require('../lib/db'),
    logger = require('../lib/logger').logger,
    moment = require('moment'),
    config = require('../configs/global/config'),
    async = require('async'),
    points = {};

points.create = function (tbl, data, callback) {
    var param_names = [],
        param_chars = [],
        param_values = [];

    for (var k in data) {
        param_names.push(k);
        param_values.push(data[k]);
        param_chars.push('$' + param_values.length);
    }
    var q = "INSERT INTO " + tbl + " (" + param_names.join(", ") + ") VALUES (" + param_chars.join(", ") + ") RETURNING *";
    console.log(q, param_values);
    db.executeQuery(q, param_values, callback);
};

points.update = function (data, callback) {
    db.updateFields('point_logs', 'id', data.id, data, callback);
};
points.remove = function (id, callback) {
    var q = `DELETE FROM point_logs WHERE id = $1`;

    db.executeQuery(q, [id], callback);
};

points.removeMultiple = (ids, callback) => {
    var params = [],
        paramIndex = [],
        q = "DELETE FROM point_logs WHERE";
    if (ids && ids.length) {
        ids.forEach(function (item, i) {
            params.push(item);
            paramIndex.push("$" + params.length);
        });

        q += " id IN (" + paramIndex.join(",") + ")";
        db.executeQuery(q, params, callback);
    } else {
        callback(null, null);
    }
};

points.get = function (id, callback) {
    var q = `SELECT * FROM point_logs WHERE id = $1`;
    db.getObject(q, [id], callback);
};
points.list = function (condition, currentPage, pageSize, callback) {
    var params = [],
        q_count = `SELECT count(*) count FROM point_logs`,
        q = `SELECT * FROM point_logs`,
        whereStr = " WHERE ",
        sp = '',
        result = {
            pagination: {
                currentPage: currentPage,
                pageSize: pageSize,
                pages: 0,
                count: 0
            },
            data: []
        };

    if (condition.id) {
        params.push(condition.id);
        whereStr += sp + "id = $" + params.length;
        sp = " AND ";
    }
    if (condition.companyId) {
        params.push(condition.companyId);
        whereStr += sp + "company_id = $" + params.length;
        sp = " AND ";
    }
    if (condition.userId) {
        params.push(condition.userId);
        whereStr += sp + "user_id = $" + params.length;
        sp = " AND ";
    }
    if (condition.actions) {
        params.push(condition.actions);
        whereStr += sp + "actions = $" + params.length;
        sp = " AND ";
    }
    if (whereStr != " WHERE ") {
        q_count += whereStr;
        q += whereStr;
    }
    db.getObject(q_count, params, function (err, countRs) {
        if (err) {
            callback(err);
        } else {
            if (countRs && countRs.count) {
                q += " ORDER BY id DESC";
                if (pageSize) {
                    params.push(pageSize);
                    q += " LIMIT $" + params.length;
                }

                if (currentPage) {
                    params.push((currentPage - 1) * pageSize);
                    q += " OFFSET $" + params.length;
                }
                result.pagination.count = countRs.count;
                result.pagination.pages = Math.ceil(countRs.count / pageSize);
                db.executeQuery(q, params, function (err, qRs) {
                    if (err) {
                        callback(err);
                    } else {
                        result.data = qRs;
                        callback(null, result);
                    }
                });
            } else {
                callback(null, result);
            }
        }
    });
};

points.getPointsForUserId = function (userId, callback) {
    var q = `SELECT SUM(change_points) AS points FROM point_logs`,
        params = [],
        year = parseInt(moment().format("YYYY")),
        month = parseInt(moment().format('M')),
        startDate,
        endDate,
        whereStr = ' WHERE ';

    if (month >= 1 && month <= 3) {
        startDate = year + '-01-01';
        endDate = year + '-04-01';
    }
    if (month >= 4 && month <= 6) {
        startDate = year + '-04-01';
        endDate = year + '-07-01';
    }
    if (month >= 7 && month <= 9) {
        startDate = year + '-07-01';
        endDate = year + '-10-01';
    }
    if (month >= 10 && month <= 12) {
        startDate = year + '-10-01';
        endDate = (year + 1) + '-01-01';
    }
    if (!userId) {
        return callback(null, 0);
    } else {
        params.push(userId);
        whereStr += ' user_id = $' + params.length;

        if (startDate) {
            params.push(startDate);
            whereStr += ' AND created >= $' + params.length;
        }

        if (endDate) {
            params.push(endDate);
            whereStr += ' AND created < $' + params.length;
        }
        if (whereStr != " WHERE ") {
            q += whereStr;
        }
        db.getObject(q, params, callback);
    }

};

points.getPointsTimes = function (condition, callback) {
    var q = `SELECT count(change_points) AS times FROM point_logs`,
        params = [],
        sp = '',
        whereStr = ' WHERE ';

    if (condition.user_id) {
        params.push(condition.user_id);
        whereStr += sp + ' user_id = $' + params.length;
        sp = ' AND ';
    }

    if (condition.company_id) {
        params.push(condition.company_id);
        whereStr += sp + ' company_id = $' + params.length;
        sp = ' AND ';
    }

    if (condition.startDate) {
        params.push(condition.startDate);
        whereStr += sp + ' created >= $' + params.length;
        sp = ' AND ';
    }

    if (condition.endDate) {
        params.push(condition.endDate);
        whereStr += sp + ' created < $' + params.length;
        sp = ' AND ';
    }

    if (condition.actions) {
        params.push(condition.actions);
        whereStr += sp + ' actions = $' + params.length;
        sp = ' AND ';
    }
    if (whereStr != " WHERE ") {
        q += whereStr;
    }
    db.getObject(q, params, callback);
};

points.getLogs = function (condition, callback) {
    var asyncs = [],
        month = condition.month,
        date = new Date();
        
    while (month && month >= 0) {
        var startDate = new Date(),
            endDate = new Date();

        q = `SELECT * FROM point_logs`;
        whereStr = ' WHERE ';
        let params = [];
        startDate.setMonth(date.getMonth() - month);
        if (month > 0) {
            endDate.setMonth(date.getMonth() - month + 1);
            endDate.setDate(1);
        } else {
            endDate = date;
        }
        startDate.setDate(1);
        
        startDate = startDate.toLocaleString().substring(0,9);
        endDate = endDate.toLocaleString().substring(0,9);
        whereStr += ' created >= $1 AND created <= $2';
        params.push(startDate);
        params.push(endDate);
        if (condition.userId) {
            params.push(condition.userId);
            whereStr += ' AND user_id = $' + params.length;
        }
        if (condition.companyId) {
            params.push(condition.companyId);
            whereStr += ' AND company_id = $' + params.length;
        }
        q += whereStr;
        q += ' ORDER BY created';
        month -= 1;
        asyncs.push(function(done) {
            db.executeQuery(q, params, done);
        });
    }
    async.parallel(asyncs, function (err, data) {
        if (err) {
            callback(true, '');
        }
        callback(null, data);
    });
    
};
points.getCompanyUserPoints = function (condition, callback) {

    var params = [],
        q = `SELECT SUM(change_points) AS user_points, user_id, SUM(saved_money) AS saved_money, SUM(CASE WHEN actions = 'purchase' THEN 1 ELSE 0 END) AS order_num FROM point_logs`,
        whereStr = ' WHERE ',
        date = moment().subtract(condition.date, 'days').format("YYYY-MM-DD");

    whereStr += ' created >= $1 AND change_points > $2 ';
    params.push(date);
    params.push(0);
    if (condition.userId) {
        params.push(condition.userId);
        whereStr += ' AND user_id = $' + params.length;
    }
    if (condition.companyId) {
        params.push(condition.companyId);
        whereStr += ' AND company_id = $' + params.length;
    }
    whereStr += ' GROUP BY user_id';
    q += whereStr;    
    db.executeQuery(q, params, function (err, pastResults) {
        if (err) {
            var msg = 'get company history info failed';
            callback(true, msg);
        } else {
            date = moment().subtract(config.pointsActive, 'days').format("YYYY-MM-DD");
            params[0] = date;
            db.executeQuery(q, params, function (err, activeResults) {
                if (err) {
                    msg = 'get company active info failed';
                    callback(true, msg);
                } else {
                    var wholeResults = {
                        pastResults: pastResults,
                        activeResults: activeResults
                    };
                    callback(false, wholeResults);
                }
            });
        }
    });

};

points.getCompanyOrUserPoints = function (condition, callback) {

    var params = [],
        q = `SELECT SUM(change_points) FROM point_logs`,
        whereStr = ' WHERE ';
        date = moment().subtract(config.pointsActive, 'days').format("YYYY-MM-DD");
        whereStr += ' created >= $1 AND change_points > $2 ';
    params.push(date);
    params.push(0);
    if (condition.userId) {
        params.push(condition.userId);
        whereStr += ' AND user_id = $' + params.length;
    }
    if (condition.companyId) {
        params.push(condition.companyId);
        whereStr += ' AND company_id = $' + params.length;    
    }
    q += whereStr;
    db.getObject(q, params, callback);
};


points.getUserSaved = function (condition, callback) {

    var params = [],
        q = `SELECT * FROM point_logs`,
        whereStr = ' WHERE ';
        date = moment().subtract(condition.num, 'months').format("YYYY-MM-DD");
        whereStr += ' created >= $1 AND change_points > $2 ';
    params.push(date);
    params.push(0);
    if (condition.user) {
        params.push(condition.user);
        whereStr += ' AND user_id = $' + params.length;
    }
    if (condition.company) {
        params.push(condition.company);
        whereStr += ' AND company_id = $' + params.length;    
    }
    q += whereStr;
    db.executeQuery(q, params, callback);
};

module.exports = points;