const restify = require('restify');
const winston = require('winston');
const router = require('./router');

const server = restify.createServer({
  name: 'rdygo-service',
  version: '1.0.0',
  formatters: {
    'application/json': (req, res, body, cb) => {
      const response = {
        code: res.statusCode,
        getStatus: function getStatus() {
          if (this.code >= 500 && this.code < 600) return 'fail';
          if (this.code >= 400 && this.code < 500) return 'error';
          return 'success';
        },
        getFinal: function getFinal() {
          const { code, message, data } = this;
          return {
            code,
            status: this.getStatus(),
            message,
            data,
          };
        },
      };
      if (Buffer.isBuffer(body)) return cb(null, body.toString('base64'));
      if (body instanceof Error) {
        response.code = body.statusCode;
        response.message = body.body;
        response.data = null;
        return cb(null, JSON.stringify(response.getFinal()));
      }
      response.message = null;
      response.data = body;
      return cb(null, JSON.stringify(response.getFinal()));
    },
  },
});

// body parser
server.use(restify.bodyParser({
  maxBodySize: ((1024 * 1024) * 5),
}));

// Cors
server.use(restify.CORS());

// Router
router(server);

// 404 notfound
server.use((req, res, next) => next(new restify.NotFoundError()));

function startServer(configuration) {
  server.listen(configuration.port, () => {
    winston.info('restify started in %s mode on http://localhost:%d; press Ctrl-C to terminate.', configuration.env, configuration.port);
    winston.info(`Nodejs Version: ${process.version}`);
  });
}
// Do not execute the application if app runs direclty i.e. node rdygo.js
// It should be executed by the command interface
if (require.main === module) {
  winston.error('you must execute the app by its command line interface');
  winston.info('./bin/rdygo-service.js -c config.json -e [dev|prod]');
} else {
  // start the server
  module.exports = startServer;
}
