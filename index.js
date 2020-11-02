const { Component } = require('@serverless-devs/s-core');
const getHelp = require('./utils/help');
const ServerlessError = require('./utils/error');
const Metrics = require('./utils/getMetrics');

class MetricsComponent extends Component {
  constructor() {
    super();
  }
  
  async metrics (inputs) {
    this.help(inputs, getHelp(inputs));
    const { Properties } = inputs;

    const {
      Service = {},
      Function = {}
    } = Properties || inputs.State || {};
    const region = Properties.Region;
    const serviceName = Service.Name;
    const functionName = Function.Name;
    if (!region) {
      new ServerlessError({
        code: 'RegionNotFount',
        message: 'Region is empty.'
      }, true);
    }
    if (!serviceName) {
      new ServerlessError({
        code: 'ServiceNameNotFount',
        message: 'Service Name is empty.'
      }, true);
    }
    if (!functionName) {
      new ServerlessError({
        code: 'FunctionNameNotFount',
        message: 'Function Name is empty.'
      }, true);
    }

    const metricsClient = new Metrics(inputs.Credentials || {}, region)
    await metricsClient.start({
      functionName,
      serviceName
    })
  }
}

module.exports = MetricsComponent;