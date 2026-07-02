process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
});
process.on('exit', (code) => {
  console.log('PROCESS EXIT EVENT WITH CODE:', code);
});

require('./dist/index.js');
