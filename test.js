const m = require('./');

const s = m({port: 4455, protocol: 'disco'}, {
  chainHeight: (response) => {
    response.send(150)
  }
})