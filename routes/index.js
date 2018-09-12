var express = require('express'),
    router = express(),
    pointsModel = require('../models/points'),
    pointsLogsBreakdownModel = require('../models/pointsLogsBreakdown'),
    config = require('../configs/global/config'),
    pointsHelper = require('../lib/helpers/points');

/* GET home page. */

router.get('/', function (req, res, next) {
    pointsModel.get(1, function (err, data) {
        console.log(data);
        console.log(config);
        res.render('index', { title: 'Express' });
    });
});

router.get('/company', function (req, res, next) {
	var companyId = req.query.companyId,
		companyPoints = 0,
		savedMoneyCompany = 0;
	pointsModel.getCompanyOrUserPoints({
	  	companyId: companyId,
	  	date: 180
	}, function (err, company) {
		//console.log(company);
		company.forEach(function (item) {
			companyPoints += Number(item.user_points);
			savedMoneyCompany += Number(item.saved_money);
		});
		var templeteData = {
			companyPoints: companyPoints,
			companyMembers: company,
			savedMoneyCompany: savedMoneyCompany,
			title: 'company'
		};
	  	res.render('company', {templeteData: templeteData});
	});
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

//points/sum?company=1&user=170
router.get('/points/sum?', function(req, res, next) {
  pointsModel.getCompanyOrUserPoints({
  	companyId: req.query.company,
  	userId: req.query.user
  }, function (err, data) {
  	res.send(data);
  });
});

//points/list?company=1&user=170&actions=purchase&page=1&pagesize=100
router.get('/points/list?', function(req, res, next) {
  pointsModel.list({
  	companyId: req.query.company,
  	userId: req.query.user,
  	actions: req.query.actions
  }, req.query.page || '1', req.query.pagesize || '10', function (err, data) {
  	res.send(data);
  });
});

//points/sumexpire?user=170
router.get('/points/sumexpire?', function(req, res, next) {
  pointsModel.getPointsForUserId(req.query.user, function (err, data) {
  	res.send(data);
  });
});

router.get('/points/distributor?', function(req, res, next) {
  pointsLogsBreakdownModel.getDistributor({
  	company: req.query.company,
  	user: req.query.user
  }, function (err, data) {
  	res.send(data);
  });
});

module.exports = router;