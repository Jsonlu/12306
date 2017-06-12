/**
 * Created by jsonlu on 17/6/12.
 */
const readline = require('readline');
const fs = require('fs');
const query = require('./src/axreq')
const log = require('./src/print')
const config = require('./config.json')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'OHAI> '
});
rl.prompt();

let i = -1;
let trains = {}

rl.on('line', function (line) {
  switch ((line.trim()).toLowerCase()) {
    case 'quit':
      rl.close();
      break;
    case 'from':
      fromStation();
      break;
    case 'to':
      toStation();
      break;
    case 'date':
      setDate();
      break;
    case 'train':
      setTrain();
      break;
    case 'turn':
      isTurn();
      break;
    default:
      if (config.is_turn) {
        if (i++ == -1) {
          console.log(i)
          query.queryWithTrainNo(function (data) {
            query.queryByTrainNo(data.train_no, function (data) {
              trains = data
            })
          })
        } else {
          if (trains.length < i + 2) {
            console.log('没有啦')
            return;
          }
          if (i == 1) {
            rl.prompt();
            log.t()
          }
          query.config.end_station = trains[trains.length - 1 - i].code
          query.config.name = query.searchName(trains[trains.length - 1 - i].code)
          query.queryWithTrainNo(function (data) {
            log.i(0, data)
          })
        }
        rl.prompt();
      }
      else {
        log.t()
        query.query(function (data) {
          for (key in data) {
            log.i(0, data[key])
          }
        })
      }
      break;
  }

});

rl.on('close', function () {
  console.log('再见');
  process.exit(0);
});

function setTrain() {
  rl.question('请输入车次(例如:D321):', function (answer) {
    config.train_num = answer
    fs.writeFileSync('./config.json', JSON.stringify(config));
    rl.prompt();
  });
}

function setDate() {
  rl.question('请输入时间(例如:2017-03-04):', function (answer) {
    config.time = answer
    fs.writeFileSync('./config.json', JSON.stringify(config));
    rl.prompt();
  });
}

function fromStation() {
  rl.question('请输入出发站(全拼，例如:beijingxi):', function (answer) {
    let name = query.searchCodeByPy(answer);
    if (name) {
      console.log('出发站:', query.searchName(name));
      config.from_station = name
      fs.writeFileSync('./config.json', JSON.stringify(config));
    } else {
      console.log('出发站不存在');
    }
    rl.prompt();
  });
}

function toStation() {
  rl.question('请输入到达站(全拼，例如shanghai):', function (answer) {
    let name = query.searchCodeByPy(answer);
    if (name) {
      console.log('到达站:', query.searchName(name));
      config.end_station = name
      fs.writeFileSync('./config.json', JSON.stringify(config));
    } else {
      console.log('到达站不存在');
    }
    rl.prompt();
  });
}

function isTurn() {
  rl.question('请输入是否按站查找(false,true):', function (answer) {
    if (!answer)
      config.is_turn = false
    else
      config.is_turn = true
    fs.writeFileSync('./config.json', JSON.stringify(config));
    rl.prompt();
  });
}
