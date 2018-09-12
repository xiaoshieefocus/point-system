# point-system


sample:

/******** 积分相关逻辑层 *******/
pointsHelper = require('../lib/helpers/points');

//计算积分
计算不同行为可以获得的积分，积分规则参见config.actionPoints
actions含义对照:
    'bom'           上传bom
    'purchase'      购买
    'invitation'    邀请新用户
    'pay'           消费积分

pointsHelper.calculatePoints(action:'bom', {number: 20}, function(err, Rs) {
	console.log(err, Rs);
});
Rs格式 {points: 10, action: 'bom'}//由于上传bom获取10积分

//修改积分
pointsHelper.changePoints({
    user_id: 1,
    company_id: 1,
    change_points: 10,
    actions: 'bom', //参考actions含义对照
}, function(err, Rs) {
    console.log(err, Rs);
});
扣除积分时，如果积分不足，返回err = 'not enough points'



/******** 积分相关数据层 *******/
pointsModel = require('../models/points'),

//获取指定用户的有效积分
pointsModel.getPointsForUserId(1, function (err, Rs) {
    console.log(err, Rs);
})
Rs格式: { points: '7' }


//获取指定用户，指定actions的次数
pointsModel.getPointsTimes({
    user_id: 1,
    actions: 'bom', //参考actions含义对照
}, function(err, Rs) {
    console.log(err, Rs);
});
Rs格式: { times: '5' }


/****** 优惠券相关数据层 ***********/
couponsModel = require('../models/coupons'),

//获取所有可兑换优惠券
couponsModel.getCouponToSeller();
Rs格式:
【{
    batch_no: '201809-50',
    start_date: '2018-09-01',
    end_date: '2018-10-31',
    status: 'active',
    allocated: '2018-09-12',
    allocated_count: 1,
    min_price: 100,
    discount: 50,
    points: 400
}]

//获取指定分值可兑换优惠券信息
couponsModel.getCouponToSeller(400);//参数400代表400积分可兑换
Rs格式:
{
    batch_no: '201809-50',
    start_date: '2018-09-01',
    end_date: '2018-10-31',
    status: 'active',
    allocated: '2018-09-12',
    allocated_count: 1,
    min_price: 100,
    discount: 50,
    points: 400
}