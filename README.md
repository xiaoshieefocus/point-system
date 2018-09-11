# point-system


sample:

/******** 积分相关逻辑层 *******/
pointsHelper = require('../lib/helpers/points');
//计算积分
pointsHelper.calculatePoints(action:'bom', {number: 20}, function(err, Rs) {
	console.log(err, Rs);
});
计算不同行为可以获得的积分，现有合法的行为为上传bom：'bom',购买：'purchase',邀请新用户：'invitation'，积分规则参见config.actionPoints
Rs格式 {points: 10, action: 'bom'}

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