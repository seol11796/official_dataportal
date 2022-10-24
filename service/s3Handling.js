
function getStationImage(stationName){
    var AWS = require('aws-sdk');

    const s3 = new AWS.S3({   accessKeyId: "AKIAUMX2QPW4D5KDSW5R",   secretAccessKey: "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" });
    
    var params = {Bucket: 'subweatherimages', Key: 'myImageFile.jpg'};
    
    var file = require('fs').createWriteStream('/path/to/file.jpg');
    
    s3.getObject(params).createReadStream().pipe(file);
    
}


module.exports = {
    getStationImage,
  };
