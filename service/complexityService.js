const api_config = require("../config/complexityApiConfig.json");
const stationNumbering = require("../config/complexityStationNumber.json");
const request = require("request");

const base_url = api_config.base_url;
const authKey = api_config.Encoding;

// *****************************
// direct return functions below

async function getComplexityPageResolve(stationName) {
  var ret = new Object();
  var now = new Date();
  var dayOfWeek = now.getDay();
  var queryTime = resolveQueryTime();

  var requesturl = complexRequireURLResolver(authKey, stationName, dayOfWeek);
  var res_json = JSON.parse(await getJsonByURL(requesturl));
  // 상행 여유, 상행 혼잡, 하행 여유, 하행 혼잡
  var keys = resolveMostTime(res_json);

  ret.complexTime = keys;
  ret.complexity_state = resolveValue(res_json, keys, queryTime);

  return ret;
}

async function getAll() {
  var requesturl = complexAllURLResolver(authKey);
  return JSON.parse(await getJsonByURL(requesturl));
}

async function getStation(stationName) {
  return await getJsonByStationName(stationName);
}

async function getMostTime(stationName) {
  var res_json = await getJsonByStationName(stationName);
  var most_time = resolveMostTime(res_json);

  var ret = new Object();
  ret.ascending_free = most_time[0];
  ret.ascending_congestion = most_time[1];
  ret.decending_free = most_time[2];
  ret.decending_congestion = most_time[3];

  return ret;
}

async function getValue(stationName) {
  var res_json = await getJsonByStationName(stationName);
  var keys = resolveMostTime(res_json);
  var query_time = resolveQueryTime();
  var value = resolveValue(res_json, keys, query_time);
  var ret = new Object();

  ret.complexity_value = value;
  return ret;
}

// ***********************
// utility functions below

function resolveQueryTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();

  if (minutes < 30) minutes = "00분";
  else minutes = "30분";
  return (queryTime = hours + "시" + minutes);
}

function resolveMostTime(res_json) {
  var keys = [0, 0, 0, 0];
  var values = [100.0, 0.0, 100.0, 0.0];

  for (var loop = 0; loop < 2; loop++) {
    var complexity_keys = Object.keys(res_json.data[loop]);
    for (var i = 0; i < 37; i++) {
      var value = res_json.data[loop][complexity_keys[i]];
      if (value < values[0 + loop * 2]) {
        values[0 + loop * 2] = value;
        keys[0 + loop * 2] = complexity_keys[i];
      }
      if (value > values[1 + loop * 2]) {
        values[1 + loop * 2] = value;
        keys[1 + loop * 2] = complexity_keys[i];
      }
      values[0 + loop * 2] = Math.min(value, values[0 + loop * 2]);
      values[1 + loop * 2] = Math.max(value, values[1 + loop * 2]);
    }
  }

  return keys;
}

function resolveValue(res_json, keys, queryTime) {
  for (var i = 0; i < 4; i++) {
    if (keys[i].length == 6 && keys[i].substr(0, 2) > "12") {
      keys[i] = "오후 " + (keys[i].substr(0, 2) * 1 - 12) + keys[i].substr(2);
    } else {
      keys[i] = "오전 " + keys[i];
    }
  }

  var mean =
    (res_json.data[0][queryTime] * 1 + res_json.data[1][queryTime] * 1) / 2;

  if (mean < 33.0) return "쾌적";
  else if (mean < 66.0) return "보통";
  else return "나쁨";
}

function getJsonByURL(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(err);
      }
    });
  });
}

async function getJsonByStationName(stationName) {
  var now = new Date();
  var dayOfWeek = now.getDay();
  var requesturl = complexRequireURLResolver(authKey, stationName, dayOfWeek);
  return JSON.parse(await getJsonByURL(requesturl));
}

function getStationNumber(stationName) {
  for (var i = 1; i < 9; i++) {
    var checkStation =
      stationNumbering[i.toString()].hasOwnProperty(stationName);
    if (checkStation) {
      return stationNumbering[i.toString()][stationName];
    }
  }
  return -1;
}

function complexRequireURLResolver(key, stationName, dayOfWeek) {
  var multiplier = 0;
  if (dayOfWeek == 0) multiplier = 284 * 2;
  if (dayOfWeek == 6) multiplier = 284;
  var querryNumber = getStationNumber(stationName) * 1 + multiplier;
  var page = "page=" + querryNumber;
  var perPage = "perPage=2";
  var serviceKey = "serviceKey=" + key;

  return base_url + "?" + page + "&" + perPage + "&" + serviceKey;
}

function complexAllURLResolver(key) {
  return base_url + "?page=1&perPage=2000&serviceKey=" + key;
}

module.exports = {
  getComplexityPageResolve,
  getAll,
  getStation,
  getMostTime,
  getValue,
};
