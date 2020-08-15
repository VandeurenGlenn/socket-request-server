const server = require('./../../index');

server({port: 6060}, {
  date: ({send}) => send(new Date())  
});