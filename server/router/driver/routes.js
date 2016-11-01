const handlders = require('./handlers');

const routes = [
  {
    method: 'get',
    path: 'drivers',
    handler: handlders.getDrivers,
  },
  {
    method: 'post',
    path: 'drivers/:id',
    handler: handlders.getDriverById,
  },
  // {
  //   method: 'put',
  //   path: 'drivers',
  //   handler: handlders,
  // },
  // {
  //   method: 'delet',
  //   path: 'drivers',
  //   handler: handlders,
  // },
];

module.exports = routes;
