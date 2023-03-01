/**
 *
 * @param {object} options {httpServer, httpsServer, port, protocol, credentials, origin, pubsub }
 * @param {object} routes
 * @returns Promise<{ close: function, connections: array }
 */
declare const socketRequestServer: (options: any, routes?: {}) => Promise<{
    close: () => any;
    connections: any[];
}>;
export { socketRequestServer as default };
