import socketResponse, { SocketResponse } from './response.js'
const startTime = new Date().getTime()
globalThis.peerMap = new Map()

const defaultRoutes = {
  ping: (response: { send: (arg0: number) => any }) => response.send(new Date().getTime()),
  uptime: (response: { send: (arg0: number) => any }) => response.send(new Date().getTime() - startTime),
  pubsub: (
    params: { topic?: any; subscribe?: any; unsubscribe?: any; value?: any },
    response: SocketResponse,
    connections: any
  ) => {
    if (!response) {
      response = params as SocketResponse
      params = {}
    }

    if (!params.topic) params.topic = 'pubsub'

    const topic = params.topic
    delete params.topic

    const send = (message: any) => {
      response.connection.send(JSON.stringify({ url: topic, status: 200, value: message }))
    }

    if (params.subscribe) {
      response.connection.subscriptions[topic] = (message: any) => {
        send(message)
      }
      globalThis.pubsub.subscribe(topic, response.connection.subscriptions[topic])
      response.send('ok', 200)
    } else if (params.unsubscribe) {
      globalThis.pubsub.unsubscribe(topic, response.connection.subscriptions[topic])
      delete response.connection.subscriptions[topic]

      for (const connection of connections) {
        if (connection !== response.connection)
          connection.send(JSON.stringify({ url: topic, status: 200, value: params }))
      }
      response.send('ok', 200)
    } else if (params.value !== undefined) {
      // should only be send raw to stars
      // for (const connection of connections) {
      // if (connection !== response.connection) connection.send(JSON.stringify({
      // url: topic, status: 200, value: params
      // }));
      // }
      globalThis.pubsub.publishVerbose(topic, params.value)
      response.send('ok', 200)
    }
  },
  peernet: (
    params: { join: boolean; peerId: any; address: any; peers?: any },
    response: { send: (arg0: any[]) => void; connection: any },
    connections: any
  ) => {
    if (params.join) {
      globalThis.peerMap.set(params.peerId, params.address)
      response.send([...globalThis.peerMap.values()])
      for (const connection of connections) {
        if (connection !== response.connection)
          socketResponse(connection, 'peernet', 'peernet').send({
            discovered: params.address
          })
      }
      return
    }
    if (params.peerId && !params.peers && params.join === undefined) {
      response.send(globalThis.peerMap.get(params.peerId) || null)
      return
    }
    if (params.peers) {
      response.send([...globalThis.peerMap.values()])
      return
    }

    if (!params.join) {
      globalThis.peerMap.delete(params.peerId)
      return
    }
  }
}

export default (routes: any) => {
  return { ...defaultRoutes, ...routes }
}
