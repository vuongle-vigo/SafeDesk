const expressLoader = require('./loaders/express');
const routesLoader = require('./loaders/routes');

function createApp() {
  const app = expressLoader();
  routesLoader(app);
  return app;
}

module.exports = createApp;