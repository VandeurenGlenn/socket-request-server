/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} route the route to handle
 */
export default (request, protocol) => {
  // console.log(request);
  const connection = request.accept(protocol, request.origin);
  console.log(`${new Date()}: Connection accepted @${protocol}`);
  return connection;
}
