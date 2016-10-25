const driver = require('./lib/driver');
const routes = {
  driver: {
    routes: [
      {
        method: 'GET',
        path: 'driver',
        handler: driver,
      },
      {
        method: 'POST',
        path: 'driver',
        handler: driver,
      },
      {
        method: 'PUT',
        path: 'driver',
        handler: driver,
      },
      {
        method: 'DELET',
        path: 'driver',
        handler: driver,
      },
    ],
  },
};

module.exports = routes;
