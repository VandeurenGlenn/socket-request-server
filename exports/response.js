/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
var socketResponse = (connection, url, id, customEvent) => {
    const send = (data = 'ok', status = 200) => connection?.send(JSON.stringify({ url, status, value: data, id, customEvent }));
    const error = (data) => connection?.send(JSON.stringify({ url, value: data }));
    return {
        connection,
        send,
        error
    };
};

export { socketResponse as default };
