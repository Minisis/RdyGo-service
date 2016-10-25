const router = require('./driver/routes'); // TODO: merge all routes into one global obj

module.exports = (server) => {
  Object.keys(router).forEach((modelRouter) => {
    router[modelRouter].routes.forEach((model) => {
      // Regiter the route only if it has method, path and handler
      if (model.method && model.path && model.handler) {
        server[model.method](model.path, model.handler);
      }
    });
  });
};
