process.env.PORT = '5003';
process.on('exit', (code) => {
  console.log('PROCESS EXIT EVENT WITH CODE:', code);
});
require('./dist/index.js');
