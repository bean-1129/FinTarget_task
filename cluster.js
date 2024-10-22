const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numWorkers = 2; 

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, starting a new worker`);
    cluster.fork();
  });
} else {
  require('./server');  // Load the server for each worker
}
