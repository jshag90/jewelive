const path = require('path');
const { startServer } = require('./runtime-server.cjs');

startServer({
  staticDir: path.join(__dirname, 'dist'),
});
