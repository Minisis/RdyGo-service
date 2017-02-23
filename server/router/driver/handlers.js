// Libs
const core = require('../../../lib/core');
const Driver = core.Driver;

// Global object
const handlers = {};

handlers.getDrivers = (req, res) => {
  Driver.getAll((err, drivers) => {
    if (err) res.send(500, err);
    res.send(201, drivers);
  });
};

handlers.createDriver = (req, res) => {
  const driverEntity = {
    email: req.body.email,
    name: req.body.name,
    city: req.body.city,
    phoneNumber: req.body.phoneNumber,
    cars: req.body.cars,
    userId: req.body.userId,
  };
  const driver = new Driver(driverEntity);
  driver.create((err, driverSaved) => {
    if (err) res.send(500, err);
    res.send(201, driverSaved);
  });
};


// This module return the global object
module.exports = handlers;
