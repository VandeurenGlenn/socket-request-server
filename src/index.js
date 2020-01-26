import { server as WebSocketServer } from 'websocket';
import socketConnection from './socket-connection.js';
import response from './socket-response.js';
import PubSub from 'little-pubsub';

const socketRequestServer = (options, routes) => {
  if (!routes && !routes.port && options) routes = options;
  else if (!options && !routes) return console.error('no routes defined');

  let {httpServer, httpsServer, port, protocol, credentials, origin, pubsub } = options;
  if (!pubsub) pubsub = new PubSub;
  if (!port) port = 6000;
  const connections = [];
  let connection;
  const startTime = new Date().getTime();
  // default routes
  if (!routes.ping) routes.ping = (response) => response.send(new Date().getTime());
    if (!routes.uptime) routes.uptime = (response) => {
      const now = new Date().getTime();
      response.send(now - startTime);
    };
    if (!routes.pubsub) {
      routes.pubsub = (params, response) => {
        if (!response) {
          response = params;
          params = {};
        }
        if (!params.topic) params.topic = 'pubsub';
        if (params.subscribe) {
          pubsub.subscribe(params.topic, message => {
            response.connection.send(JSON.stringify({url: params.topic, status: 200, value: message}));
          });
          response.send('ok', 200);
        } else if (params.unsubscribe) {
          pubsub.unsubscribe(params.topic, message => {
            response.connection.send(JSON.stringify({url: params.topic, status: 200, value: message}));
          });
          for (const connection of connections) {
            if (connection !== response.connection) connection.send(JSON.stringify({url: params.topic, status: 200, value: params}));
          }
          response.send('ok', 200);
        }
        else
          pubsub.publish(params.topic, params.value);
          response.send('ok', 200);
      };
      
    }
  // if (!protocol) protocol = 'echo-protocol';
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

	socketServer.on('request', request => {

    connection = socketConnection(request, protocol, origin);
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
      const { route, params, url, id, customEvent } = JSON.parse(data);
      // ignore api when customEvent is defined
      if (customEvent) return;
      if (routes[url]) {
        if (!params) return routes[url](response(connection, url, id));
        return routes[url](params, response(connection, url, id));
      }
      else return response(connection, url, id).error(`nop handler found for '${message.url}'`);
    }

    connection.on('message', routeHandler);
	});

  return {
    close: () => socketServer.shutDown(),
    connections
  };
};
export default socketRequestServer;
