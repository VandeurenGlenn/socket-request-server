import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import websocket from 'websocket'

import socketRequestServer from './exports/server.js'

const openClient = (url, protocol, peerId) =>
  new Promise((resolve, reject) => {
    const client = new websocket.w3cwebsocket(url, protocol)
    client.onerror = reject
    client.onopen = () => {
      client.onmessage = ({ data }) => {
        const message = JSON.parse(String(data))
        if (message.id === peerId) resolve({ client, message })
      }
      client.send(JSON.stringify({ url: 'identify', id: peerId, params: { peerId } }))
    }
  })

test('concurrent clients keep their own route connection', async () => {
  const httpServer = createServer()
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve))
  const port = httpServer.address().port
  const server = await socketRequestServer(
    { httpServer, protocol: 'test' },
    {
      identify: ({ peerId }, response) => response.send(peerId)
    }
  )

  const peers = ['peer-a', 'peer-b', 'peer-c', 'peer-d']
  const clients = []
  try {
    const results = await Promise.all(
      peers.map((peerId) => openClient(`ws://127.0.0.1:${port}`, 'test', peerId))
    )
    clients.push(...results.map(({ client }) => client))
    assert.deepEqual(
      results.map(({ message }) => message.value).sort(),
      [...peers].sort()
    )
    assert.equal(server.connections.length, peers.length)
  } finally {
    for (const client of clients) client.close()
    server.close()
    await new Promise((resolve) => httpServer.close(resolve))
  }
})
