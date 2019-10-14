const server = require('socket-request-server');

const api = {
  date: ({send}) => send(new Date())  
}

// spin up the server
server({port: 6060}, api);