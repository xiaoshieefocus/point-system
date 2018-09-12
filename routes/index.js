var express = require('express'),
    router = express.Router(),
    points = require('../models/points'),
    coupons = require('../models/coupons'),
    config = require('../configs/global/config'),
    pointsHelper = require('../lib/helpers/points');

/* GET home page. */

router.get('/', function (req, res, next) {
    points.get(1, function (err, data) {
        console.log(data);
        console.log(config);
        res.render('index', { title: 'Express' });
    });
});

router.get('/admin', function (req, res, next) {
    console.log('---ddd---');
    res.render('admin', { title: 'admin' });
});

module.exports = router;