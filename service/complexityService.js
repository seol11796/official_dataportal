var api_config = require("../config/complexityApiConfig.json");
var stationNumbering = require("../config/complexityStationNumber.json");
var request = require("request");

async function getComplexity(stationName) {
  var ret = new Object();

  const authKey = api_config.Encoding;
  var now = new Date();
  var dayOfWeek = now.getDay();
  var hours = now.getHours();
  var minutes = now.getMinutes();

  if (minutes < 30) minutes = "00분";
  else minutes = "30분";

  var queryTime = hours + "시" + minutes;

  var requesturl = complexRequireURLResolver(authKey, stationName, dayOfWeek);
  var res_json = JSON.parse(await getJSON(requesturl));
  // 상행 여유, 상행 혼잡, 하행 여유, 하행 혼잡
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

  for (var i = 0; i < 4; i++) {
    if (keys[i].length == 6 && keys[i].substr(0, 2) > "12") {
      keys[i] = "오후 " + (keys[i].substr(0, 2) * 1 - 12) + keys[i].substr(2);
    } else {
      keys[i] = "오전 " + keys[i];
    }
  }
  console.log(queryTime);
  var mean = res_json.data[0][Object.keys(queryTime)[0]];
  console.log(mean);

  ret.complexTime = keys;
  ret.complexity_state = 0;

  return ret;
}

function getJSON(url) {
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
  var base_url = api_config.base_url;
  var multiplier = 0;
  if (dayOfWeek == 0) multiplier = 284 * 2;
  if (dayOfWeek == 6) multiplier = 284;
  var querryNumber = getStationNumber(stationName) * 1 + multiplier;
  var page = "page=" + querryNumber;
  var perPage = "perPage=2";
  var serviceKey = "serviceKey=" + key;

  return base_url + "?" + page + "&" + perPage + "&" + serviceKey;
}

module.exports = {
  getComplexity,
};
