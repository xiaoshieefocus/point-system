var lineChart = echarts.init(document.getElementById('line-chart'));
var circleChart = echarts.init(document.getElementById('circle-chart'));

renderLineChart(FC.historySpent, 'spent');
renderSpentCircleChart();

function renderLineChart(data, valueName) {
    var dateList = data.map(function(item) {
        return item.month;
    });

    var valueList = data.map(function (item) {
        return item[valueName];
    });

    var option = {
        title: [{
            left: 'left',
            text: valueName + ' in order',
            textStyle: {
                fontSize: 14,
                color: '#2F3A42'
            }
        }],
        tooltip: {
            trigger: 'axis'
        },
        xAxis: [{
            data: dateList
        }],
        yAxis: [{
            splitLine: { show: false },
            axisLabel:{
                formatter:function(value, index){
                    var value_formatter = '';
                    if(valueName=='spent'){
                        value_formatter = '¥ ' +value;
                    }
                    else if(valueName=='saved'){
                        value_formatter = value + '%';
                    }
                    else{
                        value_formatter = value;
                    }  
                    return value_formatter;
                }
            }
        }],
        series: [{
            type: 'line',
            showSymbol: false,
            data: valueList,
            itemStyle: {
                normal: {
                    lineStyle: {
                        width: 5,
                        color: "#31A1C2"
                    }
                }
            },
        }]
    };

    lineChart.setOption(option);
}

function renderSpentCircleChart() {

    var option = {
        title: {
            left: 'center',
            top:'40%',
            text: '￥30,000.00',
            textStyle: {
                fontSize: 30,
                color: '#2F3A42'
            },
            subtext: 'spent in total\n2018.3 - 2018.9',
            subtextStyle:{
                fontSize: 14,
                color: '#4A4A4A'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'right',
            selectedMode:false,
            data: ['CNY orders', 'USD orders']
        },
        color: ['#AACEDC', '#31A1C2'],
        series: [
            {
                name: '',
                type: 'pie',
                radius: ['65%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [
                    { value: 0, name: 'USD orders' },
                    { value: 100, name: 'CNY orders' }]
            }
        ]
    };

    circleChart.setOption(option);

}

function renderSavedCircleChart() {

    var option = {
        title: {
            left: 'center',
            top:'40%',
            text: '￥3,000.00',
            textStyle: {
                fontSize: 30,
                color: '#2F3A42'
            },
            subtext: 'saved in total\n2018.3 - 2018.9',
            subtextStyle:{
                fontSize: 14,
                color: '#4A4A4A'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'right',
            selectedMode:false,
            data: ['Coupond', 'Discount']
        },
        color: ['#C2E0C4', '#61C77E'],
        series: [
            {
                name: '',
                type: 'pie',
                radius: ['65%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [
                    { value: 60, name: 'Coupond' },
                    { value: 40, name: 'Discount' }]
            }
        ]
    };

    circleChart.setOption(option);

}

function renderPointsCircleChart() {

    var option = {
        title: {
            left: 'center',
            top:'40%',
            text: FC.points,
            textStyle: {
                fontSize: 30,
                color: '#2F3A42'
            },
            subtext: 'active points',
            subtextStyle:{
                fontSize: 14,
                color: '#4A4A4A'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            selectedMode:false,
            x: 'right',
            data: ['Purchase', 'Upload BOM', 'Invite new user']
        },
        color: ['#E7C2C5','#D79096', '#C44747'],
        series: [
            {
                name: '',
                type: 'pie',
                radius: ['65%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [
                    { value: FC.invitePoints, name: 'Invite new user' },
                    { value: FC.bomPoints, name: 'Upload BOM' },
                    { value: FC.PurchasePoints, name: 'Purchase' }]
            }
        ]
    };

    circleChart.setOption(option);

}

$(function() {
    $('.tab-item').on('click', function (e) {
        e.preventDefault();
        if ($(this).hasClass('active')) {
            return;
        }

        var fieldName = $(this).data('chart');
        var valueName = $(this).data('value');
        renderLineChart(FC[fieldName], valueName);

        if (valueName === 'points') {
            renderPointsCircleChart();
        } else if (valueName === 'saved') {
            renderSavedCircleChart();
        } else {
            renderSpentCircleChart();
        }

        $('.tab-item').removeClass('active');
        $(this).addClass('active');
    });
});
