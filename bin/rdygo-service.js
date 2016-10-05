#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package');
const myConfig = require('my-config');
const path = require('path');
const rdygoApp = require('../server/rdygo.js');
let configuration = {};

// cli options
program
  .version(pkg.version)
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

  // execute rdygo application
  rdygoApp(configuration);
}
