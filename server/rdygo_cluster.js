const cluster = require('cluster');
const os = require('os');
const rdygoApp = require('./rdygo.js');

function startWorker() {
  const worker = cluster.fork();
  console.log('CLUSTER: Worker %d started', worker.id);
}

const rdygoCluster = (conf) => {
  if (cluster.isMaster) {
    os.cpus().forEach(() => { startWorker(); });
    // log any workers that disconnect; if a worker disconnects, it
    // should then exit, so we'll wait for the exit event to spawn
    // a new worker to replace it
    cluster.on('disconnect', (worker) => {
      console.log('CLUSTER: Worker %d disconnected from the cluster.', worker.id);
    });
    // Create new worker after one dies
    cluster.on('exit', (worker, code, signal) => {
      console.log('CLUSTER: Worker %d died with exit code %d (%s)', worker.id, code, signal);
      startWorker();
    });
  } else {
    // Start rdygo.js on worker;
    rdygoApp(conf);
  }
};

module.exports = rdygoCluster;
