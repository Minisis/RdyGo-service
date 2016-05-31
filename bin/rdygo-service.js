#!/usr/bin/env node

'use strict';

var program = require('commander'),
  pkg = require('../package'),
  winston = require('winston'),
  myConfig = require('my-config'),
  path = require('path'),
  createWorker = require('../server/worker'),
  configuration = {};

// cli options
program
  .version(pkg.version)
  .option('-c, --configuration <configuration>', 'Configuration file for real estate application')
  .option('-e, --environment <environment>', 'Environment for real estate application [local, dev]',  ['local', 'dev'])
  .parse(process.argv);

// if no arguments are given display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  // parse json config file
  configuration = myConfig.init({
    path: path.resolve(program.configuration),
    env: program.environment
  });

  // start server using current configuration
  createWorker(configuration, function(errWrker, server) {
    if (errWrker) throw errWrker;
    server
      .listen(configuration.port, configuration.ip, function(err) {
        if (err) throw err;
        winston.info('Server listening on ', configuration.port, ' port');
      });
  });
}
