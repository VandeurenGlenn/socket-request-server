const fullLog = text => {
  return console.log(`${new Date()}: ${text}`)
};

const originIsAllowed = (requestOrigin, origin) => {
    // put logic here to detect whether the specified origin is allowed.
    if (origin && requestOrigin !== origin)
        return false;
    return true;
};
/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} route the route to handle
 */
var socketConnection = (request, protocol, origin) => {
    if (origin && !originIsAllowed(request.origin, origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        fullLog(`Connection from origin ${request.origin} rejected.`);
        return;
    }
    // console.log(request);
    const connection = request.accept(protocol, request.origin);
    fullLog(`Connection accepted @${protocol}`);
    return connection;
};

export { socketConnection as default };
