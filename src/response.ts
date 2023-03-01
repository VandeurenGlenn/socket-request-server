/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
export default (connection, url: string, id: string, customEvent?): { connection: any; send: (data?: string, status?: number) => Promise<void>; error: (data: any) => Promise<void> } => {
  const send = (data = 'ok', status = 200) => connection?.send(
    JSON.stringify({url, status, value: data, id, customEvent})
  )
  const error = (data: any) => connection?.send(JSON.stringify({url, value: data}))
  return {
    connection,
    send,
    error
  }
}
