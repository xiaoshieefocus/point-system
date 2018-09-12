var db = require('../lib/db'),
    logger = require('../lib/logger').logger,
    moment = require('moment'),
    config = require('../configs/global/config'),
    coupons = {};

coupons.create = function (tbl, data, callback) {
    var param_names = [],
        param_chars = [],
        param_values = [];

    for (var k in data) {
        param_names.push(k);
        param_values.push(data[k]);
        param_chars.push('$' + param_values.length);
    }
    var q = "INSERT INTO " + tbl + " (" + param_names.join(", ") + ") VALUES (" + param_chars.join(", ") + ") RETURNING *";
    db.executeQuery(q, param_values, callback);
};

coupons.update = function (data, callback) {
    db.updateFields('coupons', 'id', data.id, data, callback);
};
coupons.remove = function (id, callback) {
    var q = `DELETE FROM coupons WHERE id = $1`;

    db.executeQuery(q, [id], callback);
};

coupons.removeMultiple = (ids, callback) => {
    var params = [],
        paramIndex = [],
        q = "DELETE FROM coupons WHERE";
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

coupons.get = function (id, callback) {
    var q = `SELECT * FROM coupons WHERE id = $1`;
    db.getObject(q, [id], callback);
};
coupons.list = function (condition, pageIndex, pagesize, callback) {
    var params = [],
        q_count = `SELECT count(*) count FROM coupons`,
        q = `SELECT * FROM coupons`,
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

coupons.getCouponToSeller = function (coupon_points) {
    var items = [],
        searchItem = {},
        year = parseInt(moment().format("YYYY")),
        month = parseInt(moment().format('M')),
        couponsItems = config.points2coupon;

    if (couponsItems && couponsItems.length) {
        couponsItems.forEach(function (item) {
            items.push({
                batch_no: moment().format("YYYYMM") + "-" + item.coupon[1],
                start_date: moment().format("YYYY-MM") + '-01',
                end_date: moment(moment().format("YYYY-MM") + '-01').add(2, 'months').subtract(1, 'days').format("YYYY-MM-DD"),
                status: 'active',
                allocated: moment().format("YYYY-MM-DD"),
                allocated_count: 1,
                min_price: item.coupon[0],
                discount: item.coupon[1],
                points: item.points
            });
        });
        if (coupon_points) {
            items.forEach(function (item) {
                searchItem = item;
                return;
            });
            return searchItem;
        } else {
            return items;
        }
    } else {
        return [];
    }
};

module.exports = coupons;