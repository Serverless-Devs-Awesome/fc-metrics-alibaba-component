const path = require('path');
const express = require('express');

const client = require('./client');
const Logger = require('./logger');
const StartServer = require('./start-service');
const ServerlessError = require('./error');

const logger = new Logger();
const requestOption = {
  method: 'GET'
}

class Metrics {
  constructor (credentials, region) {
    this.accountId = credentials.AccountID;
    this.accessKeyID = credentials.AccessKeyID;
    this.accessKeySecret = credentials.AccessKeySecret;
    this.region = region;

    this.fcClient = client.getFcClient(credentials, region);
    this.cmsClient = client.getCmsClient(credentials, region);
    
  }

  async get ({
    serviceName,
    functionName,
    endTime,
    startTime,
    period = 60,
    qualifier,
    metric,
    Project = 'acs_fc'
  }) {
    const params = {
      Project,
      Dimensions: [{
        userId: this.accountId,
        region: this.region,
        serviceName,
        functionName
      }],
      Period: period,
      Metric: metric,
      EndTime: endTime,
      StartTime: startTime
    }
    // 支持 qualifier 的指标
    if (['FunctionQualifierDestinationSuccessed', 'FunctionQualifierDestinationErrors', 'FunctionQualifierAsyncEventExpiredDropped'].includes(metric)) {
      params.Dimensions[0].qualifier = qualifier
    }
    params.Dimensions = JSON.stringify(params.Dimensions)

    logger.info(`params:: ${JSON.stringify(params)}`);

    return await this.cmsClient.request('QueryMetricList', params, requestOption)
  }

  async start (params) {
    const uri = path.join(__dirname, './static')
    const that = this;

    function callback (app) {
      app.use('/static', express.static(`${uri}/static`))

      // 设置跨域访问
      app.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
        res.header('Content-Type', 'application/json;charset=utf-8');
        next()
      })

      app.get('/', (req, res) => {
        res.header('Content-Type', 'text/html;charset=utf-8');
        res.sendFile(`${uri}/index.html`);
      })

      app.get('/get/metric', async (req, res) => {
        const { query } = req;
        logger.info(`Get /get/metric Reuqest：${query.metric}`);
        const result = await that.get({ ...params, ...query });
        logger.info(`result: ${result.Datapoints}`);
        logger.info('');
        if (result.Datapoints) {
          res.send(result.Datapoints);
        } else {
          res.send(500);
        }
      })

      app.get('/get/version', async (req, res) => {
        logger.info('Get /get/version Request');
        try {
          const list = await that.fcClient.listVersions(serviceName);
          res.send(list.data.versions);
        } catch (e) {
          new ServerlessError(e, false);
          res.send({ error: true, message: e.message })
        }
      })

      app.get('/get/alias', async (req, res) => {
        logger.info('Get /get/alias Request')
        try {
          const list = await that.fcClient.listAliases(serviceName);
          res.send(list.data.aliases);
        } catch (e) {
          new ServerlessError(e, false);
          res.send({ error: true, message: e.message })
        }
      })
    }

    const server = new StartServer({ callback });
    server.start();
  }
}

module.exports = Metrics;