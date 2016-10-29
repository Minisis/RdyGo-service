// Libs
const core = require('../../../lib/core');
const Driver = core.Driver;

// Global object
const handlers = {};

handlers.getDrivers = (req, res) => {
  Driver.getAll((err, drivers) => {
    // TODO: we need to handle err
    res.send(201, drivers);
  });
};

// This module return the global object
module.exports = handlers;
