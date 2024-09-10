import { SocketRequestConnection } from './connection.js'

export declare type SocketResponse = {
  connection: SocketRequestConnection
  send: (value: any, status?: number) => void
  error: (value: any) => void
}

/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
export default (connection: SocketRequestConnection, url: string, id: string, customEvent?): SocketResponse => {
  const send = (value: any, status = 200) =>
    connection?.send(JSON.stringify({ url, status, value: value, id, customEvent }))
  const error = (value: any) => connection?.send(JSON.stringify({ url, value: value }))
  return {
    connection,
    send,
    error
  }
}
