/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
export default (connection, url, id) => {
  const send = (data = 'ok', status = 200) => connection.send(
    JSON.stringify({url, status, value: data, id})
  )
  const error = data => connection.send(JSON.stringify({url, value: data}))
  return {
    connection,
    send,
    error
  }
}
