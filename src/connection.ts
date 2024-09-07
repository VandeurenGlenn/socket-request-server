import { fullLog } from './utils.js'
import { connection, request, server as WebSocketServer } from 'websocket'

export interface SocketRequestConnection extends connection {
  publish: (topic: string, value: any) => void
}

const originIsAllowed = (requestOrigin, origin) => {
  // put logic here to detect whether the specified origin is allowed.
  if (origin && requestOrigin !== origin) return false
  return true
}

export default (request: request, protocol, origin): SocketRequestConnection => {
  if (origin && !originIsAllowed(request.origin, origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    fullLog(`Connection from origin ${request.origin} rejected.`)
    return
  }
  // console.log(request);
  const connection = request.accept(protocol, request.origin)
  fullLog(`Connection accepted @${protocol}`)

  const socketRequestConnection = connection as SocketRequestConnection

  socketRequestConnection.publish = (topic, value) => {
    connection.send(JSON.stringify({ url: topic, status: 200, value }))
  }
  return socketRequestConnection
}
