const express = require('express');
const cors = require('cors');
const path = require('path');
const { env } = require('./dist/config/env');
const { apiRouter } = require('./dist/routes');
const { errorHandler } = require('./dist/middleware/errorHandler');

console.log('1. Imports done');
const app = express();
console.log('2. Express app instantiated');
app.use(cors({
    origin: env.frontendUrl,
    credentials: true,
}));
console.log('3. Cors middleware added');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('4. Body parsers added');
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
console.log('5. Static files middleware added');
app.get("/", (_req, res) => {
    res.json({ success: true });
});
console.log('6. Root route added');
app.use("/api", apiRouter);
console.log('7. apiRouter added');
app.use(errorHandler);
console.log('8. errorHandler added');

const server = app.listen(5003, () => {
  console.log('Server is listening...');
});

process.on('exit', (code) => {
  console.log('Exit code:', code);
});
