# socket-request-server
> Simple WebSocket request/response server

## usage
```js
const server = require('socket-request-server');
server({port: 6000}, {
  user: ({email, password}, response) => {
    if (!email || !password) {
      response.error(`Expected email & password to be defined`)
    } else {
      // do something
      response.send('some value')
    }
  }
});
```

### Custom http server
```js
const { server } = require('socket-request-server');
const { createServer } = require('http'); // optional

const httpServer = createServer(); // define your own http server
server({httpServer, port: 6000}, {
  user: ({email, password}, response) => {
    if (!email || !password) {
      response.error(`Expected email & password to be defined`)
    } else {
      // do something
      response.send('some value')
    }
  }
});

```
