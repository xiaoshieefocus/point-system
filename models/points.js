var db = require('../lib/db'),
    logger = require('../lib/logger').logger,
    moment = require('moment'),
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
points.list = function (condition, pageIndex, pagesize, callback) {
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
        params.push(condition.startDate);
        whereStr += sp + "id = $" + params.length;
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
        endDate = (year+1) + '-01-01';
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

module.exports = points;
