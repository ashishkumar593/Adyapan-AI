const express = require('express');
const { apiRouter } = require('./dist/routes');
const app = express();
app.use("/api", apiRouter);
const server = app.listen(5003, () => {
  console.log('Server is listening...');
});
process.on('exit', (code) => {
  console.log('Exit code:', code);
});
