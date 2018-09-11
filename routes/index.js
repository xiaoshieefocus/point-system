var express = require('express');
var router = express.Router();
var points = require('../models/points');
var config = require('../configs/global/config');

/* GET home page. */
router.get('/', function(req, res, next) {
  points.get(1, function (err, data) {
  	console.log(data);
  	console.log(config);
  	res.render('index', { title: 'Express' });
  });
});

module.exports = router;
