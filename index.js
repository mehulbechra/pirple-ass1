/*
* Primary file for the API
*/

// Dependencies
const cluster = require('cluster');
const os = require('os');
const server = require('./lib/server');

// Declare the app
const app = {};

// Init function
app.init = (callback) => {
  // If on master thread...
  if (cluster.isMaster) {
    // Nothing to start in the master process

    // Fork the process
    for (let i = 0; i < os.cpus().length; i += 1) {
      cluster.fork();
    }
  } else {
    // Start the server
    server.init();
  }
};

// Self invoking only if directly required
if (require.main === module) {
  app.init(() => {});
}

// Export the app
module.exports = app;
