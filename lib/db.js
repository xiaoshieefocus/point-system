var { Pool } = require('pg'),
    config = require('../configs/global/config'),
    logger = require('./logger').logger,
    conString = 'postgres://' + config.db.user + ':' + config.db.password + '@' + config.db.host + ':' + config.db.port + '/' + config.db.database,
    copyFrom = require('pg-copy-streams').from,
    Readable = require('stream').Readable,
    db = {};

const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
});

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
    logger.error('Unexpected error on idle client', err)
    process.exit(-1)
});

/**
 * Execute a query, and return the results.
 *
 * @param  {String}   sql      [description]
 * @param  {Array}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.executeQuery = function (sql, params, callback) {
    var stack = new Error('db.executeQuery');
    pool.query(sql, params, function (err, results) {
        if (err) {
            logger.error(stack);
            logger.error('sql query', err, sql, params);
            return callback(err);
        }
        callback(null, results.rows);

    });
};

db.executeQueryWithResults = function (sql, params, callback) {
    var stack = new Error('db.executeQuery');
    pool.query(sql, params, function (err, results) {
        if (err) {
            logger.error(stack);
            logger.error('sql query', err);
            return callback(err);
        }
        callback(null, results);

    });
};


/**
 * Update record for fields.
 *
 * @param  {string}     tableName    [description]
 * @param  {string}     idColumnName [description]
 * @param  {int}        idValue      [description]
 * @param  {object}     fields       object where keys are columns and values are new values
 * @param  {Function} callback     [description]
 * @return {[type]}                [description]
 */
db.updateFields = function (tableName, idColumnName, idValue, fields, callback) {

    var updateStr,
        params = [],
        fieldsArr = [],
        field,
        queryStr,
        counter = 1;

    for (field in fields) {
        if (field === idColumnName) {
            continue;
        }
        fieldsArr.push(field + '=$' + counter);
        params.push(fields[field]);
        counter++;
    }

    params.push(idValue);

    updateStr = fieldsArr.join(', ');
    queryStr = "UPDATE " + tableName + " SET " + updateStr + " WHERE " + idColumnName + " = $" + counter;

    return db.executeQuery(queryStr, params, callback);

};


/**
 * Execute sql to get a single object
 * If there is no result, return null
 * @param  {[type]}   sql      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.getObject = function (sql, params, callback) {
    return db.executeQuery(sql, params, function (err, results) {
        if (err) {
            callback(err);
        } else {
            if (results.length >= 1) {
                callback(null, results[0]);
            } else {
                callback(null, null);
            }
        }
    });
};


db.copyStream = function (query, csvString, callback) {
    let stack = new Error('db.copyStream');
    pool.connect(function (err, client, done) {

        let stream = client.query(copyFrom(query)),
            rs = new Readable();

        rs.push(csvString);
        rs.push(null);

        rs.pipe(stream).on('error', function (err) {
            done();
            callback(err);
        }).on('end', function () {

            done();
            callback(null);
        });
    });
};

/**
 * Returns raw client object.
 *
 * @param function callback Callback.
 */
db.getRawConnectionObject = function(callback) {
    pool.connect(function (err, client, done) {
        if (err) {
            return callback(err, null, null);
        }
        return callback(null, client, done);
    });
};

module.exports = db;
