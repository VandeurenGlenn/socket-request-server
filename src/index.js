import { server as WebSocketServer } from 'websocket';
import socketConnection from './socket-connection.js';
import response from './socket-response.js';

const socketRequestServer = (options, routes) => {
  if (!routes && !routes.port && options) routes = options;
  else if (!options && !routes) return console.error('no routes defined');

  let {httpServer, httpsServer, port, protocol, credentials} = options;
  if (!port) port = 6000;
  if (!protocol) protocol = 'echo-protocol';
  if (!httpServer && !httpsServer) {
    const { createServer } = credentials ? require('https') : require('http');
    if (credentials) httpServer = createServer(credentials);
    else httpServer = createServer();

    httpServer.listen(port, () => {
      console.log(`listening on ${port}`);
    });
  }

	const socketServer = new WebSocketServer({
  	httpServer,
  	autoAcceptConnections: false
	});

	const originIsAllowed = origin => {
  	// put logic here to detect whether the specified origin is allowed.
  	return true;
	};

  const connections = [];
  let connection;

	socketServer.on('request', request => {
  	if (!originIsAllowed(request.origin)) {
  		// Make sure we only accept requests from an allowed origin
  		request.reject();
  		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
  		return;
  	}

    connection = socketConnection(request, protocol);
    connections.push(connection);

    const routeHandler = message => {
      let data;
      if (message.type) {
        switch (message.type) {
          case 'binary':
            data = message.binaryData.toString();
            break;
          case 'utf8':
            data = message.utf8Data;
            break;
        }
      }
      const { route, params, url, id } = JSON.parse(data);
      if (routes[url]) routes[url](params, response(connection, url, id));
      else return `nothing found for ${message.url}`;
    }

    connection.on('message', routeHandler);
	});

  return {
    close: () => socketServer.shutDown(),
    connections: () => connections
  };
};
export default socketRequestServer;
