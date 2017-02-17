import React, { PropTypes, Component } from 'react'
import * as d3 from 'd3'
import crossfilter from 'crossfilter'
import dc from 'dc'
import styles from './index.less'
var d3_date = Date;
function d3_time_interval(local, step, number) {

  function round(date) {
    var d0 = local(date), d1 = offset(d0, 1);
    return date - d0 < d1 - date ? d0 : d1;
  }

  function ceil(date) {
    step(date = local(new d3_date(date - 1)), 1);
    return date;
  }

  function offset(date, k) {
    step(date = new d3_date(+date), k);
    return date;
  }

  function range(t0, t1, dt) {
    var time = ceil(t0), times = [];
    if (dt > 1) {
      while (time < t1) {
        if (!(number(time) % dt)) times.push(new Date(+time));
        step(time, 1);
      }
    } else {
      while (time < t1) times.push(new Date(+time)), step(time, 1);
    }
    return times;
  }

  function range_utc(t0, t1, dt) {
    try {
      d3_date = d3_date_utc;
      var utc = new d3_date_utc();
      utc._ = t0;
      return range(utc, t1, dt);
    } finally {
      d3_date = Date;
    }
  }

  local.floor = local;
  local.round = round;
  local.ceil = ceil;
  local.offset = offset;
  local.range = range;

  var utc = local.utc = d3_time_interval_utc(local);
  utc.floor = utc;
  utc.round = d3_time_interval_utc(round);
  utc.ceil = d3_time_interval_utc(ceil);
  utc.offset = d3_time_interval_utc(offset);
  utc.range = range_utc;

  return local;
}
function d3_time_interval_utc(method) {
  return function(date, k) {
    try {
      d3_date = d3_date_utc;
      var utc = new d3_date_utc();
      utc._ = date;
      return method(utc, k)._;
    } finally {
      d3_date = Date;
    }
  };
}
function n_minutes_interval(nmins) {
    var denom = 6e4*nmins;
    return d3_time_interval(function(date) {
      return new d3_date(Math.floor(date / denom) * denom);
    }, function(date, offset) {
      date.setTime(date.getTime() + Math.floor(offset) * denom); // DST breaks setMinutes
    }, function(date) {
      return date.getMinutes();
    });
}
class AlertBar extends Component{
  constructor(){
    super()
  }
  componentDidMount(){
    function randomDate(start, end) {
        var d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return d;
    }
    // Months are 0 indexed...
    var start = new Date(2013, 10, 1, 2);
    var end = new Date(2013, 10, 1, 6);


    function genData(start,end){
      var d = [];
      for(var i = 0; i < 200; i++) {
        d[i] = {
          date: randomDate(start, end).getTime(),
          value: Math.floor(Math.random() * 3000)
        }

      }
      return d;
    }
    var data = genData(start,end)


    // Create the crossfilter for the relevant dimensions and groups.
    var min5 = n_minutes_interval(5);
    var alertList = crossfilter(data)


    var width = screen.width - 160 - 50;
    var height = 80
    var margins = {top: 0, right: 20, bottom: 25, left: 15}
    var dim2 = alertList.dimension(function(d) { return d.date; });
    var grp2 = dim2.group(min5).reduceSum(function(d) { return d.value; });
    var chart = dc.barChart(".dc-chart")
                  .width(width)
                  .height(height)
                  .margins(margins)
                  .dimension(dim2)
                  .group(grp2)
                  .round(dc.round.floor)
                  .renderHorizontalGridLines(true)
                  .x(d3.time.scale().domain([start, end]))
                  .xUnits(min5.range)
                  .filter([new Date(2013, 10, 1, 3), new Date(2013, 10, 1, 6)])

    chart.xAxis().tickSize(0).tickPadding(10).tickFormat(d3.time.format('%H:%M'));
    chart.render();


    chart.on('filtered', function(d,f){
      // console.log(f)
    })

    setInterval(function(){
      alertList.remove()
      alertList.add(genData(new Date(2013, 10, 1, 3),new Date(2013, 10, 1, 7)))
      chart.x(d3.time.scale().domain([new Date(2013, 10, 1, 3),new Date(2013, 10, 1, 7)]))
           .filter([new Date(2013, 10, 1, 4), new Date(2013, 10, 1, 7)])
      dc.redrawAll()
    },3000)
  }
  render(){
    return (
      <div className={styles.timeAlert}>
        <div id="date-chart" className="dc-chart">

        </div>
        <div className={styles.xAxisLine}></div>
      </div>
    )
  }

}
export default AlertBar