import { SocketRequestConnection } from './connection.js'

/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
export default (
  connection: SocketRequestConnection,
  url: string,
  id: string,
  customEvent?
): {
  connection: SocketRequestConnection
  send: (data?: any, status?: number) => void
  error: (data: any) => void
} => {
  const send = (data: any, status = 200) =>
    connection?.send(JSON.stringify({ url, status, value: data, id, customEvent }))
  const error = (data: any) => connection?.send(JSON.stringify({ url, value: data }))
  return {
    connection,
    send,
    error
  }
}
