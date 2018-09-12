var express = require('express'),
    router = express(),
    pointsModel = require('../models/points'),
    companiesModel = require('../models/companies'),
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
		discountLevel = config.discountLevel,
		companyPoints = 0,
		index = -1,
		discount = 0,
		savedMoneyCompany = 0;

	companiesModel.get(companyId, function (err, company) {
		if (err) {
			res.json('get company failed');
		}
		pointsModel.getCompanyUserPoints({
		  	companyId: companyId,
		  	date: 180
		}, function (err, userData) {
			var pastResults = userData.pastResults,
				activeResults = userData.activeResults;
			activeResults.forEach(function (item) {
				companyPoints += Number(item.user_points);
			});
			pastResults.forEach(function (item) {
				savedMoneyCompany += Number(item.saved_money);
			});
			pastResults.forEach(function (item) {
				item.saved_rate = ((item.saved_money / savedMoneyCompany).toFixed(4)) * 100;
			});
			pastResults.sort(function (a, b) {
				if (a.user_points > b.user_points) return -1;
				if (a.saved_rate > b.saved_rate) return -1;
				return 1;
			});
			index = discountLevel.findIndex(item => companyPoints < item.points);
			if (index > 0) {
				discount = discountLevel[index].discount;
			}
			
		  	res.render('company', {
		  		company: company,
		  		discount: discount,
				companyPoints: companyPoints,
				companyPast: pastResults,
				companyActive: activeResults,
				savedMoneyCompany: savedMoneyCompany,
				title: 'company'
		  	});
		});
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
        res.json({ points: points });
    });
});


//points/list?company=1&user=170&actions=purchase&page=1&pagesize=100
router.get('/points/list?', function (req, res, next) {
    pointsModel.list({
        companyId: req.query.company,
        userId: req.query.user,
        actions: req.query.actions
    }, req.query.page || '1', req.query.pagesize || '10', function (err, data) {
        res.send(data);
    });
});

//points/sumexpire?user=170
router.get('/points/sumexpire?', function (req, res, next) {
    pointsModel.getPointsForUserId(req.query.user, function (err, data) {
        res.send(data);
    });
});

router.get('/points/distributor?', function (req, res, next) {
    pointsLogsBreakdownModel.getDistributor({
        company: req.query.company,
        user: req.query.user
    }, function (err, data) {
        res.send(data);
    });
});

router.get('/individual?', function (req, res, next) {
    var result = {
    	pointsThisMonth : '',
    	pointsValid : ''
    };
    pointsModel.getCompanyOrUserPoints({
        userId: req.query.user
    }, function (err, data) {
    	console.log(data);
        result.pointsThisMonth = data.sum;
    });
    pointsLogsBreakdownModel.getDistributor({
        user: req.query.user
    }, function (err, data) {
        
    });

    res.send(result);
});


module.exports = router;