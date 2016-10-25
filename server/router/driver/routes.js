const handlders = require('./handlers');

const routes = [
  {
    method: 'get',
    path: 'drivers',
    handler: handlders.getDrivers,
  },
  // {
  //   method: 'post',
  //   path: 'drivers',
  //   handler: handlders,
  // },
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
