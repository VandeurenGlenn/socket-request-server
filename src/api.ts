import socketResponse from './response.js'
const startTime = new Date().getTime()
globalThis.peerMap = new Map()

const defaultRoutes = {
  ping: (response: { send: (arg0: number) => any }) => response.send(new Date().getTime()),
  uptime: (response: { send: (arg0: number) => any }) => response.send(new Date().getTime() - startTime),
  pubsub: (params: { topic?: any; subscribe?: any; unsubscribe?: any; value?: any }, response: { connection: { send: (arg0: string) => void }; send: (arg0: string, arg1: number) => void }, connections: any) => {
    if (!response) {
      response = params
      params = {}
    }

    if (!params.topic) params.topic = 'pubsub';

    const topic = params.topic
    delete params.topic

    if (params.subscribe) {
      globalThis.pubsub.subscribe(topic, (message: any) => {
        response.connection.send(JSON.stringify({url: topic, status: 200, value: message}));
      })
      response.send('ok', 200);
    } else if (params.unsubscribe) {
      globalThis.pubsub.unsubscribe(topic, (message: any) => {
        response.connection.send(JSON.stringify({url: topic, status: 200, value: message}));
      })
      for (const connection of connections) {
        if (connection !== response.connection) connection.send(JSON.stringify({url: topic, status: 200, value: params}));
      }
      response.send('ok', 200);
    }
    else if (params.value !== undefined)
      // should only be send raw to stars
      // for (const connection of connections) {
        // if (connection !== response.connection) connection.send(JSON.stringify({
          // url: topic, status: 200, value: params
        // }));
      // }
      globalThis.pubsub.publish(topic, params.value);
      response.send('ok', 200);  
  },
  peernet: (params: { join: any; peerId: any; address: any }, response: { send: (arg0: any[]) => void; connection: any }, connections: any) => {
    if (params.join) {
      globalThis.peerMap.set(params.peerId, params.address)
      response.send([...globalThis.peerMap.values()])
      for (const connection of connections) {
        if (connection !== response.connection)
          socketResponse(connection, 'peernet', 'peernet').send({discovered: params.address})
      }
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