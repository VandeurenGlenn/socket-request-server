/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
export default (connection, url) => {
  const send = (data = 'ok', status = 200) => connection.send(
    JSON.stringify({url, status, value: data})
  )
  const error = data => connection.send(JSON.stringify({url, value: data}))
  return {
    send,
    error
  }
}
