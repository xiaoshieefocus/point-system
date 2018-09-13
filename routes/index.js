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
    var userId = req.query.userId,
        companyId = req.query.companyId,
        month_num = req.query.num || '6',
        templateData = {
            startMoth: moment().subtract(6, 'months').format("YYYY.MM"),
            endMoth: moment().format("YYYY.MM"),
            pointsThisMonth: '',
            pointsValid: '',
            distributors: '',
            savedMoney: '',
            distributorsForCompany: '',
            coupons: '',
            discount: 0,
            rank: 1,
            userRank: [],
            company: ''
        };

    if (!companyId || !userId) {
        return res.send('miss userId or companyId');
    }
    async.parallel({
    	companyName: callback =>{
    		companiesModel.get(companyId, function(err,data){
    			templateData.company = data;
    			callback();
    		})
    	},
        rank: callback => {
            var MAX_INT = 9007199254740992;
            pointsModel.list({
                companyId: companyId,
            }, 0, MAX_INT, function (err, data) {
                var user = [],
                    rank = [];
                data.data.forEach(function (item) {
                    if (item.change_points > 0) {
                        if (user.indexOf(item.user_id) < 0) {
                            user.push(item.user_id);
                            rank.push({
                                user: item.user_id,
                                saved: parseInt(item.saved_money),
                                orders: 1,
                                points: parseInt(item.change_points)
                            });
                        } else {
                            rank[user.indexOf(item.user_id)].points += parseInt(item.change_points);
                            rank[user.indexOf(item.user_id)].saved += parseInt(item.saved_money);
                            rank[user.indexOf(item.user_id)].orders += 1;
                        }
                    }
                })
                rank.sort(function (a, b) {
                    return b.points - a.points;
                })
                templateData.userRank = rank;
                for(var i = 0; i < rank.length; i++){
                	if(userId == rank[i].user){
		                templateData.rank += i;
		        	}
                }
                callback();
            });
        },
        discount: callback => {
            pointsModel.getCompanyOrUserPoints({ companyId: companyId }, function (err, data) {
                if (data.sum < config.discountLevel[0].points) {
                    templateData.discount = config.discountLevel[0].discount;
                } else {
                    config.discountLevel.forEach(function (item) {
                        if (data.sum > item.points) {
                            templateData.discount = item.discount;
                        }
                    })

                }

                callback();
            })
        },
        pointsThisMonth: callback => {
            pointsModel.getCompanyOrUserPoints({ userId: userId }, function (err, data) {
                templateData.pointsThisMonth = data.sum;
                callback();
            })
        },
        pointsValid: callback => {
            pointsModel.getPointsForUserId(userId, function (err, data) {
                templateData.pointsValid = data.points;
                callback();
            })

        },
        distributor: callback => {
            pointsLogsBreakdownModel.getDistributor({
                user: userId
            }, function (err, data) {
                templateData.distributors = data;
                callback();
            });
        },
        distributorsForCompany: callback => {
            pointsLogsBreakdownModel.getDistributor({
                company: companyId
            }, function (err, data) {
                templateData.distributorsForCompany = data;
                callback();
            });
        },
        savedMoney: callback => {
            pointsModel.getUserSaved({
                num: month_num,
                company: companyId,
                user: userId
            }, function (err, data) {
                var month = moment().format("MM"),
                    saved = [],
                    sum = [],
                    percent = [],
                    num = month_num;
                for (var i = 0; i < num; i++) {
                    saved.push(0);
                    sum.push(0);
                    percent.push({
                        month: ((month - i + 12) % 12),
                        value: 0,
                    });
                }
                data.forEach(function (item) {
                    var index = (month - moment(item.created).format("MM"));
                    index = index < 0 ? (index + 12) : index;
                    saved[index] += parseInt(item.saved_money);
                    sum[index] += parseInt(item.change_points);
                })
                for (var i = 0; i < num; i++) {

                    percent[i].value = saved[i] * 100 / sum[i];
                }
                templateData.savedMoney = percent;
                callback();
            });
        },
        coupons: callback => {
            couponsModel.list({ user: userId }, function (err, data) {
                templateData.coupons = data;
                callback();
            });
        }
    }, (err, data) => {
        templateData.title = 'my points';
        templateData.moment = moment;
        res.render('index', templateData);
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
                if (a.user_points * 1 >= b.user_points * 1) return -1;
                if (a.user_points * 1 < b.user_points * 1) return 1;
                if (a.saved_rate >= b.saved_rate) return -1;
                if (a.saved_rate < b.saved_rate) return 1;
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
                var date = new Date(),
                    month = 6;
                companyLogs.forEach(function (monthData) {
                    let spent = 0,
                        saved = 0,
                        points = 0,
                        startDate = new Date();
                    startDate.setMonth(date.getMonth() - month);
                    startDate = startDate.toLocaleString().substring(0, 6);
                    monthData.forEach(function (item) {
                        spent += Number(item.change_points);
                        saved += Number(item.saved_money);
                        points += Number(item.change_points);
                    });
                    historySpent.push({ month: startDate, spent: spent });
                    historySaved.push({ month: startDate, saved: (saved / spent).toFixed(4) * 100 });
                    historyPoints.push({ month: startDate, points: points });
                    month -= 1;
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


//individual?user=1&company=2&num=4
router.get('/individual?', function (req, res, next) {
    var result = {
        pointsThisMonth: '',
        pointsValid: '',
        distributors: '',
        savedMoney: '',
        distributorsForCompany: '',
        discount: '',
        coupons: '',
        rank: ''
    };
    async.parallel({
        rank: callback => {
            var MAX_INT = 9007199254740992;
            pointsModel.list({
                companyId: req.query.company,
            }, 0, MAX_INT, function (err, data) {
                var user = [],
                    rank = [];
                data.data.forEach(function (item) {
                    if (item.change_points > 0) {
                        if (user.indexOf(item.user_id) < 0) {
                            user.push(item.user_id);
                            rank.push({
                                user: item.user_id,
                                points: parseInt(item.change_points)
                            });
                        } else {
                            rank[user.indexOf(item.user_id)].points += parseInt(item.change_points);
                        }
                    }
                })
                rank.sort(function (a, b) {
                    return b.points - a.points;
                })
                result.rank = rank;
                callback();
            });
        },
        pointsThisMonth: callback => {
            pointsModel.getCompanyOrUserPoints({ userId: req.query.user }, function (err, data) {
                result.pointsThisMonth = data.sum;
                callback();
            })
        },
        discount: callback => {
            pointsModel.getCompanyOrUserPoints({ companyId: req.query.company }, function (err, data) {
                if (data.sum < config.discountLevel[0].points) {
                    result.discount = config.discountLevel[0].discount;
                } else {
                    config.discountLevel.forEach(function (item) {
                        if (data.sum > item.points) {
                            result.discount = item.discount;
                        }
                    })

                }

                callback();
            })
        },
        pointsValid: callback => {
            pointsModel.getPointsForUserId(req.query.user, function (err, data) {
                result.pointsValid = data.points;
                callback();
            })

        },
        distributor: callback => {
            pointsLogsBreakdownModel.getDistributor({
                user: req.query.user
            }, function (err, data) {
                result.distributors = data;
                callback();
            });
        },
        distributorsForCompany: callback => {
            pointsLogsBreakdownModel.getDistributor({
                company: req.query.company
            }, function (err, data) {
                result.distributorsForCompany = data;
                callback();
            });
        },
        savedMoney: callback => {
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
                for (var i = 0; i < num; i++) {
                    saved.push(0);
                    sum.push(0);
                    percent.push({
                        month: ((month - i + 12) % 12),
                        value: 0,
                    });
                }
                data.forEach(function (item) {
                    var index = (month - moment(item.created).format("MM"));
                    index = index < 0 ? (index + 12) : index;
                    saved[index] += parseInt(item.saved_money);
                    sum[index] += parseInt(item.change_points);
                })
                for (var i = 0; i < num; i++) {

                    percent[i].value = saved[i] * 100 / sum[i];
                }
                console.log(sum);
                result.savedMoney = percent;
                callback();
            });
        },
        coupons: callback => {
            couponsModel.list({ user: req.query.user }, function (err, data) {
                result.coupons = data;
                callback();
            });
        }

    }, (err, data) => {

        res.send(result);
    });
});



module.exports = router;