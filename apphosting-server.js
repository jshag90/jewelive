const path = require('path');
const { startServer } = require('./frontend/runtime-server.cjs');

startServer({
  staticDir: path.join(__dirname, 'frontend', 'dist'),
});
