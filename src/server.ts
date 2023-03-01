import { server as WebSocketServer } from 'websocket';
import socketConnection from './connection.js';
import socketResponse from './response.js';
import PubSub from '@vandeurenglenn/little-pubsub';
import api from './api.js';

if (!globalThis.PubSub) globalThis.PubSub = PubSub
if (!globalThis.pubsub) globalThis.pubsub = new PubSub()

/**
 * 
 * @param {object} options {httpServer, httpsServer, port, protocol, credentials, origin, pubsub }
 * @param {object} routes 
 * @returns Promise<{ close: function, connections: array }
 */
const socketRequestServer = async (options, routes = {}) => {
  // if (!routes && !routes.port && options) routes = options;
  // else if (!options && !routes) return console.error('no routes defined');

  let {httpServer, httpsServer, port, protocol, credentials, origin, pubsub } = options;
  if (!pubsub) pubsub = new PubSub(false);
  if (!port) port = 6000;
  const connections = [];
  let connection;
  routes = api(routes)
  // default routes
  
  // if (!protocol) protocol = 'echo-protocol';
  if (!httpServer && !httpsServer) {
    const { createServer } = credentials ? await import('https') : await import('http');
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
      const { params, url, id, customEvent } = JSON.parse(data);
      // ignore api(routes) when customEvent is defined
      if (customEvent) return;
      if (routes[url]) {
        if (!params) return routes[url](socketResponse(connection, url, id), connections);
        return routes[url](params, socketResponse(connection, url, id), connections);
      }
      else return socketResponse(connection, url, id).error(`no handler found for '${message.url}'`);
    }
    connection.on('message', routeHandler);
	})
  return {
    close: () => socketServer.shutDown(),
    connections
  }
}

export { socketRequestServer as default }
