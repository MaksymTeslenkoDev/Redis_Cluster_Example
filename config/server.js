'use strict';
const path = require('node:path');
const { StreamForLogger } = require('../src/logger.js');

module.exports = ({ envs, appPath }) =>
  Object.freeze({
    logger: {
      level: envs.LOG_LEVEl || 'info',
      stream: new StreamForLogger(path.join(appPath, './logs')),
    },
  });
