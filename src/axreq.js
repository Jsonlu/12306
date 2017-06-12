/**
 * Created by jsonlu on 17/6/11.
 */

const https = require('https');
const co = require('co')
const fs = require('fs')
const axios = require('axios')
const config = require('../config.json')

const stationInfo = require('./data.json').data
https.globalAgent.options.ca = fs.readFileSync('./cert/srca.cer.pem');


const UA = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36";

const instance = axios.create({
  baseURL: 'https://kyfw.12306.cn/otn/',
  timeout: 8000,
  headers: {
    Connection: 'keep-alive',
    Host: 'kyfw.12306.cn',
    'User-Agent': UA,
    Connection: "keep-alive",
    Referer: "https://kyfw.12306.cn/otn/leftTicket/init",
    Cookie: "" +
    "__NRF=D2A7CA0EBB8DD82350AAB934FA35URRR; " +
    "JSESSIONID=0C02F03F9852081DDBFEA4AA03EF4252C569EB7TTY; "
  }
});


var queryByTrainNo = function (no, back) {
  co(function *() {
    let url = 'czxx/queryByTrainNo?train_no=' + no + '&from_station_telecode=' + config.from_station + '&to_station_telecode=' + config.end_station + '&depart_date=' + config.time;
    let d = yield instance.get(url)
    d = d.data.data.data
    let from = searchName(config.from_station)
    let end = searchName(config.end_station)
    let s = 0, e = 0
    for (let x in d) {
      if (from == d[x].station_name) {
        s = x
      }
      if (end == d[x].station_name) {
        e = x
      }
    }

    let res = []
    for (let i = s; i <= e; i++) {
      d[i].code = searchCode(d[i].station_name)
      res.push(d[i])
    }
    back(res)
  })
}

var query = function (back) {
  co(function *() {
    let url = 'leftTicket/log?leftTicketDTO.train_date=' + config.time + '&leftTicketDTO.from_station=' + config.from_station + '&leftTicketDTO.to_station=' + config.end_station + '&purpose_codes=' + config.purpose_codes;
    instance.get(url).then(function (dd) {
      if (dd.data.httpstatus != 200)
        return;
      let url = 'leftTicket/query?leftTicketDTO.train_date=' + config.time + '&leftTicketDTO.from_station=' + config.from_station + '&leftTicketDTO.to_station=' + config.end_station + '&purpose_codes=' + config.purpose_codes;
      instance.get(url).then(function (json) {
        let d = []
        try {
          let jsonData = json.data.data.result
          for (let i = 0; i < jsonData.length; i++) {
            let theTrain = jsonData[i];
            let datalist = theTrain.split('|');
            let tickets = {};

            let trainNum = datalist[3];
            let endStation = datalist[7];
            let train_no = datalist[2];
            let departureTime = datalist[8];
            let arrivalTime = datalist[9];
            let durationTime = datalist[10];

            let advancedSoftBerth = datalist[21];
            let softBerth = datalist[23];
            let hardBerth = datalist[28];

            let softSeat = 0;
            let hardSeat = datalist[29];
            let standing = datalist[26];

            let advancedClass = datalist[25];
            let businessClass = datalist[32];
            let firstClass = datalist[30];
            let secondClass = datalist[31];


            tickets.trainNum = trainNum
            tickets.departureTime = departureTime
            tickets.arrivalTime = arrivalTime
            tickets.durationTime = durationTime
            tickets.advancedSoftBerth = advancedSoftBerth
            tickets.advancedClass = advancedClass
            tickets.businessClass = businessClass
            tickets.firstClass = firstClass
            tickets.secondClass = secondClass
            tickets.softBerth = softBerth
            tickets.hardBerth = hardBerth
            tickets.softSeat = softSeat
            tickets.hardSeat = hardSeat
            tickets.standing = standing
            tickets.train_no = train_no
            tickets.endStation = endStation
            tickets.endStationName = searchName(endStation)

            if(config.is_turn){
              if (trainNum == config.train_num) {
                d.push(tickets)
              }
            }else {
              d.push(tickets)
            }
          }
          back(d)
          // console.log(d)
        } catch (error) {
          console.log(searchName(config.end_station) + '---->' + json.status)
        }
      })

    })
  })
}

var queryWithTrainNo = function (back) {
  query(function (data) {
    for (let k in data) {
      if (data[k].trainNum == config.train_num) {
        back(data[k])
      }
    }
  })
}

var searchCode = function (name) {
  for (let key in stationInfo) {
    if (stationInfo[key].name == name)
      return stationInfo[key].suo
  }
  return '';
}

var searchCodeByPy = function (name) {
  for (let key in stationInfo) {
    if (stationInfo[key].quan == name)
      return stationInfo[key].suo
  }
  return 0;
}

var searchName = function (code) {
  for (let key in stationInfo) {
    if (stationInfo[key].suo == code)
      return stationInfo[key].name
  }
  return '';
}

module.exports = {
  queryWithTrainNo: queryWithTrainNo,
  queryByTrainNo, queryByTrainNo,
  config: config,
  searchCode: searchCode,
  searchName: searchName,
  searchCodeByPy: searchCodeByPy,
  query:query
}
