var express = require('express'),
    router = express(),
    pointsModel = require('../models/points'),
    couponsModel = require('../models/coupons'),
    companiesModel = require('../models/companies'),
    pointsLogsBreakdownModel = require('../models/pointsLogsBreakdown'),
    config = require('../configs/global/config'),
    async = require('async'),
    moment = require('moment'),
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
		historySpent = [],
		historySaved = [],
		historyPoints = [],
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
		  	month: 6
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
			pointsModel.getLogs({
				month: 6,
				companyId: companyId
			}, function (err, companyLogs) {
				companyLogs.forEach(function (monthData) {
					let spent = 0,
						saved = 0,
						points = 0;
					monthData.forEach(function (item) {
						spent += Number(item.change_points);
						saved += Number(item.saved_money);
						points += Number(item.change_points);
					});
					historySpent.push(spent);
					historySaved.push((saved / spent).toFixed(4) * 100);
					historySaved.push(saved);
					historyPoints.push(points);
				});
				
				res.render('company', {
					historySpent: historySpent,
					historySaved: historySaved,
					historyPoints: historyPoints,
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


//individual?user=1&company=2&num=4
router.get('/individual?', function (req, res, next) {
    var result = {
    		pointsThisMonth: '',
    		pointsValid: '',
    		distributors: '',
    		savedMoney: '',
    		distributorsForCompany: '',
    		coupons: ''
    	};
    async.parallel({
    	pointsThisMonth : callback => {
    		pointsModel.getCompanyOrUserPoints({userId: req.query.user}, function (err, data) {
	        	result.pointsThisMonth = data.sum;
	        	callback();
	    	})
    	},
    	pointsValid : callback => {
    		pointsModel.getPointsForUserId(req.query.user, function (err, data) {
	        	result.pointsValid = data.points;
	        	callback();
    		})
    		
    	},
    	distributor : callback => {
    		pointsLogsBreakdownModel.getDistributor({
		        user: req.query.user
		    }, function (err, data) {
		        result.distributors = data;
		        callback();
		    });
    	},
    	distributorsForCompany : callback => {
    		pointsLogsBreakdownModel.getDistributor({
		        company: req.query.company
		    }, function (err, data) {
		        result.distributorsForCompany = data;
		        callback();
		    });
    	},
    	savedMoney : callback => {
    		pointsModel.getUserSaved({
    			num: req.query.num || '6',
    			company: req.query.company,
		        user: req.query.user
		    }, function (err, data) {
		    	var month = moment().format("MM"),
		    		saved = [],
		    		sum = [],
		    		percent = [],
		    		num = req.query.num || '6';
		    	for(var i = 0; i < num; i++){
		    		saved.push(0);
		    		sum.push(0);
		    		percent.push({
		    			month: ((month - i + 12) % 12),
		    			value: 0,
		    		});
		    	}
		    	data.forEach(function(item){
		    		var index = (month - moment(item.created).format("MM"));
		    		index = index < 0 ? (index + 12) : index;
		    		saved[index] += parseInt(item.saved_money);
		    		sum[index] += parseInt(item.change_points);
		    	})
		    	for(var i = 0; i < num; i++){
		    		
		    		percent[i].value = saved[i] * 100 / sum[i];
		    	}
		    	console.log(sum);
		        result.savedMoney = percent;
		        callback();
		    });
    	},
    	coupons : callback => {
    		couponsModel.list({user: req.query.user}, function(err, data){
    			result.coupons = data;
    			callback();
    		});   		
    	}
    	
    }, (err, data) => {
	    
	    res.send(result);
	});

    
});



module.exports = router;