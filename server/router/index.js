const driverRoutes = require('./driver/routes');
const rideRoutes = require('./ride/routes');
const userRoutes = require('./user/routes');
const waitingListRoutes = require('./waitingList/routes');

const routes = [...driverRoutes, ...rideRoutes, ...userRoutes, ...waitingListRoutes];


// Routes Registry
module.exports = (server) => {
  let route;
  for (route of routes) {
    // Register the route only if it has method, path and handler
    if (route.method && route.path && route.handler) {
      server[route.method](route.path, route.handler);
    }
  }
};
