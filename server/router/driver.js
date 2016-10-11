
// TODO: add routes for driver
// GET, POST, PUT, DELETE

function getDrivers(req, res) {
  return res.send(201, 'response test we are live again');
}
module.exports = (server) => {
  server.get('/drivers', getDrivers);
  // server.get('/drivers:driverId', getDrivers);

  // server.post('/drivers', testFunction);
};
