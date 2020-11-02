const { Component } = require('@serverless-devs/s-core');
const { Logger } = require('./utils/logger');

class xyzComponent extends Component {
  constructor() {
    super();
    this.logger = new Logger();
  }
}

module.exports = xyzComponent