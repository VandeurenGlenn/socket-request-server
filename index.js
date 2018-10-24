/* socket-request-server version 0.4.0 */
'use strict';

const ENVIRONMENT = {version: '0.4.0', production: true};

var websocket = require('websocket');

/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} route the route to handle
 */
var socketConnection = (request, protocol) => {
  // console.log(request);
  const connection = request.accept(protocol, request.origin);
  console.log(`${new Date()}: Connection accepted @${protocol}`);
  return connection;
};

/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
var response = (connection, url) => {
  const send = (data = 'ok', status = 200) => connection.send(
    JSON.stringify({url, status, value: data})
  );
  const error = data => connection.send(JSON.stringify({url, value: data}));
  return {
    send,
    error
  }
};

const socketRequestServer = (options, routes) => {
  if (!routes && !routes.port && options) routes = options;
  else return console.error('no routes defined');

  let {httpServer, port, protocol} = options;
  if (!port) port = 6000;
  if (!protocol) protocol = 'echo-protocol';
  if (!httpServer) {
    const { createServer } = require('http');
    httpServer = createServer();

    httpServer.listen(port, () => {
      console.log(`listening on ${port}`);
    });
  }

	const socketServer = new websocket.server({
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
  	if (!originIsAllowed(request.origin)) ;

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
      const { route, params, url } = JSON.parse(data);
      if (routes[url]) routes[url](params, response(connection, url));
      else return `nothing found for ${message.url}`;
    };

    connection.on('message', routeHandler);
	});

  return {
    close: () => socketServer.shutDown(),
    connections: () => connections
  };
};

module.exports = socketRequestServer;
