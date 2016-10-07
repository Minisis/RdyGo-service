const driver = require('./driver');
// const ride = require('./ride');
// const user = require('./user');
// const waitingList = require('./waitingList');

module.exports = (server) => {
  driver(server);
  // ride(server);
  // user(server);
  // waitingList(server);
};
