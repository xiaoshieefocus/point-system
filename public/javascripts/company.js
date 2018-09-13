var lineChart = echarts.init(document.getElementById('line-chart'));
var circleChart = echarts.init(document.getElementById('circle-chart'));

renderLineChart(FC.historySpent, 'spent');
renderCircleChart();

function renderLineChart(data, valueName) {
    var dateList = data.map(function(item) {
        return item.month;
    });

    var valueList = data.map(function (item) {
        return item[valueName];
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
            left: 'left',
            text: valueName + ' in order'
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

function renderCircleChart() {

    var option = {
        tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'right',
            data: ['Coupond', 'Discount']
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
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [
                    { value: 40, name: 'Coupond' },
                    { value: 60, name: 'Discount' }]
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
        renderCircleChart();

        $('.tab-item').removeClass('active');
        $(this).addClass('active');
    });
});
