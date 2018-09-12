var express = require('express'),
    router = express.Router(),
    pointsModel = require('../models/points'),
    couponsModel = require('../models/coupons'),
    config = require('../configs/global/config'),
    pointsHelper = require('../lib/helpers/points');


router.post('/buyCounpon', function (req, res, next) {
    var result = {
            success: false,
            msg: '',
        },
        user_id = req.body.user_id,
        company_id = req.body.company_id || null,
        points = req.body.points || 0,
        qty = req.body.qty || 1,
        newCoupon = couponsModel.getCouponToSeller(points);;


    if (!user_id) {
        result.msg = 'MISS user_id';
        return res.json(result);
    }
    if (newCoupon) {
        newCoupon.allocated_count = qty;
        newCoupon.user_id = user_id;
    } else {
        result.msg = 'no ' + points + ' points coupon';
        return res.json(result);
    }
    points = points * qty;
    pointsModel.getPointsForUserId(user_id, function (err, pointsRs) {
        console.log(pointsRs, points);
        if (!pointsRs || !pointsRs.points || pointsRs.points < points) {
            result.msg = 'not enough points';
            return res.json(result);
        }

        pointsHelper.changePoints({
            user_id: user_id,
            company_id: company_id,
            change_points: points * -1,
            actions: 'pay',
        }, function(err, changeRs) {
            if (err) {
                result.msg = err;
                return res.json(result);
            } else {
                console.log(changeRs);
                couponsModel.create('coupons', newCoupon, function(err, addRs) {
                    if (err) {
                        result.msg = 'add coupon failed';
                        return res.json(result);
                    } else {
                        result.success = true;
                        return res.json(result);
                    }
                });
            }
        });
    });
});

module.exports = router;