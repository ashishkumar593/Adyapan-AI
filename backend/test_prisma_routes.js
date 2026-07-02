const express = require('express');
const { prisma } = require('./dist/config/prisma');
const { apiRouter } = require('./dist/routes');
const app = express();
app.use('/api', apiRouter);
app.listen(5003, () => {
  console.log('Express with Prisma and Routes running on 5003');
});
