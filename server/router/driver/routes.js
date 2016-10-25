const driverHandlders = require('./handlers');

const routes = {
  driver: {
    routes: [
      {
        method: 'get',
        path: 'drivers',
        handler: driverHandlders.getDrivers,
      },
      // {
      //   method: 'post',
      //   path: 'drivers',
      //   handler: driverHandlders,
      // },
      // {
      //   method: 'put',
      //   path: 'drivers',
      //   handler: driverHandlders,
      // },
      // {
      //   method: 'delet',
      //   path: 'drivers',
      //   handler: driverHandlders,
      // },
    ],
  },
};

module.exports = routes;
