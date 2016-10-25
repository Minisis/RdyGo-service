// Libs
const core = require('../../../lib/core');
const Driver = core.Driver;

// Global object
const handlers = {};

handlers.getDrivers = (req, res) => {
  res.send(201, Driver.getAll());
};

// This module return the global object
module.exports = handlers;
