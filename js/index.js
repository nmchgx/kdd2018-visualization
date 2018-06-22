$(document).ready(function ($) {
    // pollution
    for (var i = 0; i < typeList.length; i++) {
        $("#pollution-type").append("<option value=" + typeList[i] + ">" + typeList[i] + "</option>");
    }
    var type = typeList[0];
    $("#pollution-type").val(type);

    $("#pollution-type").change(function () {
        type = $(this).val();
        showPollution(type, 0, convertPollutionData(type, 0));
    });
    showPollution(type, 0, convertPollutionData(type, 0));

    // wind
    showWind();

    // heatmap
    showHeatmap();

    // pollution line
    for (var i = 0; i < pollution_timeline.length; i++) {
        $("#pollution-type-2").append("<option value=" + i + ">" + Object.keys(pollution_timeline[i])[0] + "</option>");
    }
    $("#pollution-type-2").val(0);

    $("#pollution-type-2").change(function () {
        station = $(this).val();
        showPollutionLine(station, convertPollutionLineData(station));
    });
    showPollutionLine(0, convertPollutionLineData(0));

    if (window.CollectGarbage) {
        setInterval(function () {
            CollectGarbage();
        }, 30000);
    }
});

var pollutionBox = echarts.init(document.getElementById('pollution-box'));
var pollutionLineBox = echarts.init(document.getElementById('pollution-line-box'));
var typeList = ["PM2.5", "PM10", "CO", "SO2", "O3", "NO2"];

var sizeFunction = function (x) {
    var y = Math.sqrt(x) + 1;
    return y * 2;
};

var convertPollutionData = function (type, date) {
    var res = [];
    for (var staion in pollution[date].data) {
        res.push({
            name: staion,
            value: [stationInfo[staion].longitude, stationInfo[staion].latitude, parseInt(pollution[date].data[staion][type])]
        });
    }
    return res;
};

var convertWindData = function (date) {
    var res = [];
    for (var i = 0; i < wind[date].data.length; i++) {
        var item = wind[date].data[i]
        res.push({
            name: i,
            value: [item.longitude, item.latitude, item.wind_speed],
            symbolRotate: item.wind_direction
        });
    }
    return res;
};

var convertPollutionLineData = function (station) {
    var res = {};
    var label = [];
    var data = [];
    var pt = Object.values(pollution_timeline[station])[0];
    for (var i = 0; i < pt.length; i++) {
        var date = Object.keys(pt[i])[0];
        var value = Object.values(pt[i])[0]
        label.push(date);
        data.push(value);
    }
    res['label'] = label;
    res['data'] = data;
    return res;
};

function showPollution(type, tempDate, data) {
    pollutionBox.clear();
    var option = {
        baseOption: {
            animationDurationUpdate: 1000,
            animationEasingUpdate: 'quinticInOut',
            timeline: {
                axisType: 'category',
                orient: 'vertical',
                autoPlay: true,
                inverse: true,
                playInterval: 1000,
                left: null,
                right: 20,
                top: 20,
                bottom: 20,
                width: 100,
                height: null,
                label: {
                    normal: {
                        textStyle: {
                            color: '#999'
                        }
                    },
                    emphasis: {
                        textStyle: {
                            color: '#fff'
                        }
                    }
                },
                symbol: 'none',
                lineStyle: {
                    color: '#555'
                },
                checkpointStyle: {
                    color: '#bbb',
                    borderColor: '#777',
                    borderWidth: 2
                },
                controlStyle: {
                    showNextBtn: false,
                    showPrevBtn: false,
                    normal: {
                        color: '#666',
                        borderColor: '#666'
                    },
                    emphasis: {
                        color: '#aaa',
                        borderColor: '#aaa'
                    }
                },
                data: []
            },
            backgroundColor: '#404a59',
            title: [{
                text: tempDate,
                left: '20',
                top: '60',
                textStyle: {
                    fontSize: 40,
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }, {
                text: type,
                left: '10',
                top: '10',
                textStyle: {
                    fontSize: 20,
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }],
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return params.name + ' : ' + params.value[2];
                }
            },
            legend: {
                orient: 'vertical',
                y: 'bottom',
                x: 'right',
                data: [type],
                textStyle: {
                    color: '#fff'
                }
            },
            visualMap: {
                min: 0,
                max: 200,
                calculable: true,
                inRange: {
                    color: ['#50a3ba', '#eac736', '#d94e5d']
                },
                textStyle: {
                    color: '#fff'
                }
            },
            geo: {
                map: '北京',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#111'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: [{
                name: tempDate,
                type: 'scatter',
                coordinateSystem: 'geo',
                symbolSize: function (val) {
                    return sizeFunction(val[2]);
                },
                data: data,
                itemStyle: {
                    emphasis: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            }],
        },
        options: []
    }

    for (var i = 0; i < pollution.length; i++) {
        option.baseOption.timeline.data.push(pollution[i].date);
        option.options.push({
            title: {
                show: true,
                'text': pollution[i].date
            },
            series: [{
                name: pollution[i].date,
                type: 'scatter',
                coordinateSystem: 'geo',
                symbolSize: function (val) {
                    return sizeFunction(val[2]);
                },
                data: convertPollutionData(type, i),
                itemStyle: {
                    emphasis: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            }]
        });
    }

    pollutionBox.setOption(option);
};

function showWind() {
    var windBox = echarts.init(document.getElementById('wind-box'));
    var data = convertWindData(0);
    var option = {
        baseOption: {
            animationDurationUpdate: 1000,
            animationEasingUpdate: 'quinticInOut',
            timeline: {
                axisType: 'category',
                orient: 'vertical',
                autoPlay: true,
                inverse: true,
                playInterval: 1000,
                left: null,
                right: 20,
                top: 20,
                bottom: 20,
                width: 100,
                height: null,
                label: {
                    normal: {
                        textStyle: {
                            color: '#999'
                        }
                    },
                    emphasis: {
                        textStyle: {
                            color: '#fff'
                        }
                    }
                },
                symbol: 'none',
                lineStyle: {
                    color: '#555'
                },
                checkpointStyle: {
                    color: '#bbb',
                    borderColor: '#777',
                    borderWidth: 2
                },
                controlStyle: {
                    showNextBtn: false,
                    showPrevBtn: false,
                    normal: {
                        color: '#666',
                        borderColor: '#666'
                    },
                    emphasis: {
                        color: '#aaa',
                        borderColor: '#aaa'
                    }
                },
                data: []
            },
            backgroundColor: '#404a59',
            title: [{
                text: wind[0].date,
                left: '20',
                top: '60',
                textStyle: {
                    fontSize: 40,
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }, {
                text: '2017-01-01',
                left: '10',
                top: '10',
                textStyle: {
                    fontSize: 20,
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }],
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return params.name + ' : ' + params.value[2];
                }
            },
            legend: {
                orient: 'vertical',
                y: 'bottom',
                x: 'right',
                data: ['pm2.5'],
                textStyle: {
                    color: '#fff'
                }
            },
            visualMap: {
                min: 0,
                max: 21,
                calculable: true,
                inRange: {
                    color: ['#50a3ba', '#eac736', '#d94e5d']
                },
                textStyle: {
                    color: '#fff'
                }
            },
            geo: {
                map: '北京',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#111'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: [{
                name: wind[0].date,
                type: 'scatter',
                coordinateSystem: 'geo',
                symbol: 'arrow',
                symbolSize: function (val) {
                    return val[2] * 1.5;
                },
                data: data,
                itemStyle: {
                    emphasis: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            }],
        },
        options: []
    }

    for (var i = 0; i < wind.length; i++) {
        option.baseOption.timeline.data.push(wind[i].date);
        option.options.push({
            title: {
                show: true,
                'text': wind[i].date
            },
            series: [{
                name: wind[i].date,
                type: 'scatter',
                coordinateSystem: 'geo',
                symbolSize: function (val) {
                    return val[2] * 1.5;
                },
                data: convertWindData(i),
                itemStyle: {
                    emphasis: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            }]
        });
    }

    windBox.setOption(option);
};

function showHeatmap() {
    var chart = echarts.init(document.getElementById('wind-box-mini'));
    var data = convertWindData(0);
    var option = {
        baseOption: {
            animationDurationUpdate: 1000,
            animationEasingUpdate: 'quinticInOut',
            timeline: {
                axisType: 'category',
                orient: 'vertical',
                autoPlay: true,
                inverse: true,
                playInterval: 1000,
                left: null,
                right: 10,
                top: 20,
                bottom: 20,
                width: 70,
                height: null,
                label: {
                    normal: {
                        textStyle: {
                            color: '#999'
                        }
                    },
                    emphasis: {
                        textStyle: {
                            color: '#fff'
                        }
                    }
                },
                symbol: 'none',
                lineStyle: {
                    color: '#555'
                },
                checkpointStyle: {
                    color: '#bbb',
                    borderColor: '#777',
                    borderWidth: 2
                },
                controlStyle: {
                    showNextBtn: false,
                    showPrevBtn: false,
                    normal: {
                        color: '#666',
                        borderColor: '#666'
                    },
                    emphasis: {
                        color: '#aaa',
                        borderColor: '#aaa'
                    }
                },
                data: []
            },
            backgroundColor: '#404a59',
            title: [{
                text: wind[0].date,
                left: '200',
                top: '5',
                textStyle: {
                    fontSize: 40,
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }, {
                text: '2017-01-01',
                left: '10',
                top: '10',
                textStyle: {
                    fontSize: 20,
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }],
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return params.name + ' : ' + params.value[2];
                }
            },
            legend: {
                orient: 'vertical',
                y: 'bottom',
                x: 'right',
                data: ['pm2.5'],
                textStyle: {
                    color: '#fff'
                }
            },
            visualMap: {
                min: 0,
                max: 21,
                calculable: true,
                inRange: {
                    color: ['#50a3ba', '#eac736', '#d94e5d']
                },
                textStyle: {
                    color: '#fff'
                }
            },
            geo: {
                map: '北京',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#111'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: [{
                name: wind[0].date,
                type: 'scatter',
                coordinateSystem: 'geo',
                symbol: 'arrow',
                symbolSize: function (val) {
                    return val[2];
                },
                data: data,
                itemStyle: {
                    emphasis: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            }],
        },
        options: []
    }

    for (var i = 0; i < wind.length; i++) {
        option.baseOption.timeline.data.push(wind[i].date);
        option.options.push({
            title: {
                show: true,
                'text': wind[i].date
            },
            series: [{
                name: wind[i].date,
                type: 'scatter',
                coordinateSystem: 'geo',
                symbolSize: function (val) {
                    return val[2];
                },
                data: convertWindData(i),
                itemStyle: {
                    emphasis: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            }]
        });
    }

    chart.on('timelinechanged', function (params) {
        $("#humidity-heatmap").attr('src', './data/humidity/' + wind[params.currentIndex].date + '.png');
        $("#pollution-heatmap").attr('src', './data/pm25/' + wind[params.currentIndex].date + '.png');
    });

    chart.setOption(option);
};

function showPollutionLine(station, res) {
    console.log(res)
    pollutionLineBox.clear();
    var option = {
        animationDurationUpdate: 1000,
        animationEasingUpdate: 'quinticInOut',
        backgroundColor: '#404a59',
        title: {
            text: Object.keys(pollution_timeline[station])[0],
            left: '10',
            top: '10',
            textStyle: {
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.7)'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return params.name + ' : ' + params.value;
            }
        },
        xAxis: {
            type: 'category',
            data: res.label,
            axisLine: {
                lineStyle: {
                    color: '#fff'
                }
            }
        },
        yAxis: {
            axisLine: {
                lineStyle: {
                    color: '#fff'
                }
            }
        },
        series: {
            name: Object.keys(pollution_timeline[station])[0],
            type: 'line',
            data: res.data,
            lineStyle: {
                color: '#eac736'
            }
        }
    }

    pollutionLineBox.setOption(option);
};