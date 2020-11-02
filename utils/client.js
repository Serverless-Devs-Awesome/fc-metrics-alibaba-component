const Core = require('@alicloud/pop-core');
const FC = require('@alicloud/fc2');

const getFcClient = (credentials, region) => {
  return new FC(credentials.AccountID, {
    accessKeyID: credentials.AccessKeyID,
    accessKeySecret: credentials.AccessKeySecret,
    region: region,
    timeout: 60000
  })
}

const getCmsClient = (credentials, region) => {
  return new Core({
    accessKeyId: credentials.AccessKeyID,
    accessKeySecret: credentials.AccessKeySecret,
    endpoint: `http://metrics.${region}.aliyuncs.com`,
    apiVersion: '2018-03-08'
  })
}

module.exports = {
  getFcClient,
  getCmsClient
}