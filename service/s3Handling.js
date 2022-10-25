
var key_config = require("../config/s3Config.json");
const { FSx } = require('aws-sdk');
var AWS = require('aws-sdk');

// const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
var region = 'ap-northeast-2"';

const access_key = key_config.access_key;
const secret_key  = key_config.secret_key;


const bucket_name = 'images';

// Bucket 만들기 
async function createS3Bucket(){

    const access_key = key_config.access_key;
    const secret_key  = key_config.secret_key;
    
    const S3 = new AWS.S3({
        access_key,
        secret_key,
        region,
        credentials: {
            accessKeyId : AKIAUMX2QPW4BDMTWTPH,
            secretAccessKey: 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
        }
    });
    

var createdBucket = 
    await S3.createBucket({
        Bucket: bucket_name,
        CreateBucketConfiguration: {}
    }).promise()

    return createdBucket;
}

// Bucket 목록 조회 
async function lookupBucket(){
let {Buckets } = await S3.listBuckets().promise();
for(let bucket of Buckets)
{
    console.log(bucket.Name);
}

}

// Bucket 파일 업로드 
async function uploadBucketFile(){
let object_name = 'subway-images/';

await S3.putObject({
    Bucket: bucket_name,
    Key : object_name
}).promise()


await S3.project({
    Bucket:bucket_name,
    Key: object_name,
    ACL : 'public-read',
    Body: fs.createReadStream(local_file_path)
}).promise();

}



module.exports = {
    createS3Bucket,
    lookupBucket,
  };