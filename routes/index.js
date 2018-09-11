var express = require('express'),
	router = express.Router(),
	points = require('../models/points'),
	config = require('../configs/global/config'),
	pointsHelper = require('../lib/helpers/points');

/* GET home page. */
router.get('/', function(req, res, next) {
  points.get(1, function (err, data) {
  	console.log(data);
  	console.log(config);
  	res.render('index', { title: 'Express' });
  });
});

module.exports = router;
