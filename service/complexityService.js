var api_config = require("../config/complexityApiConfig.json");
var request = require("request");

async function getComplexity(stationName) {
  authKey = api_config.Encoding;

  geturl = complexRequireURLResolver(authKey, stationName);
  request(geturl, (err, response, body) => {
    if (err) throw err;
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
