
var api_config = require("../config/complexityApiConfig.json");
var stationNumbering = require("../config/complexityStationNumber.json");
var request = require("request");

async function getComplexity(stationName) {
  const authKey = api_config.Encoding;
  var now = new Date();
  var dayOfWeek = now.getDay();

  var requesturl = complexRequireURLResolver(authKey, stationName, dayOfWeek);
  var res_json = JSON.parse(await getJSON(requesturl));
  var keys = [0, 0, 0, 0];
  // 상행 여유, 상행 혼잡, 하행 여유, 하행 혼잡
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