const Logger = require('./logger');

class ServerlessError {
  constructor({ code, message }, throwError = true) {
    const logger = new Logger();
    if (throwError) {
      throw new Error({ code, message });
    } else {
      logger.error(message);
    }
  }

}

module.exports = ServerlessError;