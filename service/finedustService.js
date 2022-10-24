var api_config = require("../config/finedustApiConfig.json");
var request = require("request");
var xml2js = require('xml-js');




async function getFinedust(stationName) {
  authKey = api_config.authKey;


  geturl = finedustRequireURLResolver(authKey, stationName);
  request(geturl, (err, response, body) => {
    if (err) throw err;
    var xmlToJson = xml2js.xml2json(body, {spaces:4});
    //console.log(xmlToJson);
    var res_json = JSON.parse(xmlToJson); 
    console.log(res_json.elements.elements[2]); //elements의 elements의 row부분 elements의 pmq
    
    
    })

 
}

function getStationNumber(stationName) {
  stationNumber = stationName;
  return 3;
}

function finedustRequireURLResolver(key, stationName) {
  base_url = api_config.base_url;

  start_station = getStationNumber(stationName);
  end_station = getStationNumber(stationName);


  return base_url + start_station + "/" + end_station;
}//http://openapi.seoul.go.kr:8088/7963444664796a703130395845777855/xml/airPolutionInfo/(시작역 번호)/(끝역 번호)/

module.exports = {
  getFinedust,
};

