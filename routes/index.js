var express = require('express'),
    router = express(),
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
    res.render('admin', { title: 'admin' });
});

router.post('/actions', function (req, res, next) {
	var action = req.body.action || '',
		number = req.body.number || 0,
		price = req.body.price || 0,
		params = {
			number: number,
			price: price
		};
	pointsHelper.calculatePoints(action, params, function (err, points) {
		res.json({points: points});
	});
});

module.exports = router;