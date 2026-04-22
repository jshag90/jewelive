const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 8080);
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Jewel-Live frontend server listening on ${port}`);
});
