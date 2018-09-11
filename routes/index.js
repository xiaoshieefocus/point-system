var express = require('express');
var router = express.Router();
var points = require('../models/points');

/* GET home page. */
router.get('/', function(req, res, next) {
  points.get([], function (err, data) {
  	console.log(data);
  	res.render('index', { title: 'Express' });
  });
});

module.exports = router;
