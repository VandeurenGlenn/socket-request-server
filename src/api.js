const startTime = new Date().getTime()
globalThis.peerMap = new Map()

const defaultRoutes = {
  ping: response => response.send(new Date().getTime()),
  uptime: response => response.send(new Date().getTime() - startTime),
  pubsub: (params, response, connections) => {
    if (!response) {
      response = params
      params = {}
    }

    if (!params.topic) params.topic = 'pubsub';

    const topic = params.topic
    delete params.topic

    if (params.subscribe) {
      pubsub.subscribe(topic, message => {
        response.connection.send(JSON.stringify({url: topic, status: 200, value: message}));
      })
      response.send('ok', 200);
    } else if (params.unsubscribe) {
      pubsub.unsubscribe(topic, message => {
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
      pubsub.publish(topic, params.value);
      response.send('ok', 200);  
  },
  peernet: (params, response, connections) => {
    if (params.join) {
      peerMap.set(params.peerId, params.address)
      response.send([...peerMap.values()])
      for (const connection of connections) {
        if (connection !== response.connection)
          socketResponse(connection, 'peernet', 'peernet').send({discovered: params.address})
      }
      return
    }
    if (!params.join) {
      peerMap.delete(params.peerId)
      return response.send()
    }
  }
}

export default (routes) => {
  return { ...defaultRoutes, ...routes }
}