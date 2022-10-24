
var api_config = require("../config/complexityApiConfig.json");
var request = require("request");

async function getComplexity(stationName) {
  const authKey = api_config.Encoding;

  var requesturl = complexRequireURLResolver(authKey, stationName);
  var res_json = JSON.parse(await getJSON(requesturl));
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
  console.log(values);
  console.log(keys);
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
  stationNumber = stationName;
  return 3;
}

function complexRequireURLResolver(key, stationName) {
  base_url = api_config.base_url;
  page = "page=" + getStationNumber(stationName);
  perPage = "perPage=2";
  serviceKey = "serviceKey=" + key;

  return base_url + "?" + page + "&" + perPage + "&" + serviceKey;
}

module.exports = {
  getComplexity,
};