#!/usr/bin/env node
'use stric';
const program = require('commander');
const myConfig = require('my-config');
const path = require('path');
const rdygoApp = require('../server/rdygo.js');
const core = require('../lib/core');
let configuration = {};

// cli options
program
  .version('1.0.0')
  .option('-c, --configuration <configuration>', 'Configuration file for real estate application')
  .option('-e, --environment <environment>',
              'Environment for application state [dev, prod]', ['dev', 'prod'])
  .parse(process.argv);

// if no arguments are given display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  // parse json config file
  configuration = myConfig.init({
    path: path.resolve(program.configuration),
    env: program.environment,
  });

  // DB CONNECTION
  core.connect(configuration.mongo);
  // execute rdygo application
  rdygoApp(configuration);
}
