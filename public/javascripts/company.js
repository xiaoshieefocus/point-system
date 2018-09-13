var lineChart = echarts.init(document.getElementById('line-chart'));

renderSpentLineChart();

function renderSpentLineChart() {
    var dateList = FC.historySpent.map(function(item) {
        return item.month;
    });

    var valueList = FC.historySpent.map(function (item) {
        return item.spent;
    });

    var option = {

        // Make gradient line here
        visualMap: [{
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 400
        }],


        title: [{
            left: 'center',
            text: 'Gradient along the y axis'
        }],
        tooltip: {
            trigger: 'axis'
        },
        xAxis: [{
            data: dateList
        }],
        yAxis: [{
            splitLine: { show: false }
        }],
        series: [{
            type: 'line',
            showSymbol: false,
            data: valueList
        }]
    };

    lineChart.setOption(option);
}
