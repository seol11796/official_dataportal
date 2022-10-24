var api_config = require("../config/finedustApiConfig.json");
var request = require("request");

async function getFinedust(stationName) {
  authKey = api_config.authKey;

  geturl = finedustRequireURLResolver(authKey, stationName);
  request(geturl, (err, response, body) => {
    if (err) throw err;
  });
}

function getStationNumber(stationName) {
  stationNumber = stationName;
  return 3;
}

function finedustRequireURLResolver(key, stationName) {
  base_url = api_config.base_url;
  page = "page=" + getStationNumber(stationName);
  perPage = "perPage=2";
  serviceKey = "serviceKey=" + key;

  return base_url + "?" + page + "&" + perPage + "&" + serviceKey;
}

module.exports = {
  getFinedust,
};