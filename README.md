# point-system


sample:

/******** 积分相关逻辑层 *******/
pointsHelper = require('../lib/helpers/points');
//修改积分
pointsHelper.changePoints({
    user_id: 1,
    company_id: 1,
    change_points: 10,
    actions: '测试积分',
}, function(err, Rs) {
    console.log(err, Rs);
});
扣除积分时，如果积分不足，返回err = 'not enough points'



/******** 积分相关数据层 *******/
points = require('../models/points'),
//获取指定用户的有效积分
points.getPointsForUserId(1, function (err, Rs) {
    console.log(err, Rs);
})
Rs格式: { points: '7' }


//获取指定用户，指定actions的次数
points.getPointsTimes({
    user_id: 1,
    actions: '测试积分',
}, function(err, Rs) {
    console.log(err, Rs);
});
Rs格式: { times: '5' }