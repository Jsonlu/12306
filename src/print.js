/**
 * Created by jsonlu on 17/6/12.
 */

const _titleList = ['车次', '起点', '终点', '开车', '到达', '历时', '商务', '一等', '二等', '软卧', '硬卧', '软座', '硬座', '站票'];
const query = require('./axreq')
const from_station = require('../config.json').from_station
const start = query.searchName(from_station)
var fixedlengthString = function (theStr, length) {
  var strlen = 0;
  for (var i = 0; i < theStr.length; i++) {
    if (theStr.charCodeAt(i) > 255)
      strlen += 2;
    else
      strlen++;
  }

  if (strlen < length) {
    var strlist = new Array();
    strlist.push(theStr);
    for (var i = strlen; i < length; i++) {
      strlist.push(' ');
    }
    return strlist.join('');
  } else {
    return theStr.substr(0, length);
  }
}

var log = function (b, data) {
  let ticket = []
  ticket.push(fixedlengthString(data.trainNum, 10))
  ticket.push(fixedlengthString(start, 10))
  ticket.push(fixedlengthString(data.endStationName, 10))
  ticket.push(fixedlengthString(data.departureTime, 10))
  ticket.push(fixedlengthString(data.arrivalTime, 10))
  ticket.push(fixedlengthString(data.durationTime, 10))
  ticket.push(fixedlengthString(data.businessClass, 10))
  ticket.push(fixedlengthString(data.firstClass, 10))
  ticket.push(fixedlengthString(data.secondClass, 10))
  ticket.push(fixedlengthString(data.softBerth, 10))
  ticket.push(fixedlengthString(data.hardBerth, 10))
  ticket.push(fixedlengthString(data.softSeat, 10))
  ticket.push(fixedlengthString(data.hardSeat, 10))
  ticket.push(fixedlengthString(data.standing, 10))
  if (b)
    console.log(_titleList.join('      '));
  console.log(ticket.join(''));
}

module.exports = {
  i: log,
  t: function () {
    console.log(_titleList.join('      '));
  }
}
