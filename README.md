# socket-request-server
> Simple WebSocket request/response server

## INSTALL 
```sh
npm i --save socket-request-server
```
## usage

## basic
```js
const server = require('socket-request-server');
server({port: 6000}, {
  date: ({send}) => response.send(new Date())  
});
```

### Custom http server
```js
const { server } = require('socket-request-server');
const { createServer } = require('http'); // optional

const httpServer = createServer(); // define your own http server
server({httpServer, port: 6000}, {
  user: ({email, password}, response) => {
    // response.connection.socket._peername
    if (!email || !password) {
      response.error(`Expected email & password to be defined`)
    } else {
      // do something
      response.send('some value')
    }
  }
});

```

### customEvent
```js
const server = require('socket-request-server');
server({port: 6000}, {
  // does nothing when a customEvent is detected
  ping: ({email, password}, response) => {
    response.send(true)
  }
});

const connection = server.connections()[0]
const messageId = uuid();

const data = JSON.stringify({
  url: 'ping',
  status: 200,
  value: message,
  id: messageId,
  customMessage: true
});

const onmessage = message => {
  let data;
  if (message.type) {
    switch (message.type) {
      case 'binary':
        data = message.binaryData.toString();
        break;
      case 'utf8':
        data = message.utf8Data;
        break;
    }
  }
  
  const { route, params, url, id } = JSON.parse(data);          
  if (id === messageId) {
    // do something ...
    connection.removeListener('message', onmessage)
  }
}
connection.on('message', onmessage)
connection.send(data)
```
