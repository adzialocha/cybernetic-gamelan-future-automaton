const cors = require('cors')
const express = require('express')
const path = require('path')
const peerServer = require('peer').ExpressPeerServer

const LOCAL_PORT = 9090

const app = express()

app.set(
  'port',
  process.env.NODE_ENV === 'production' ? process.env.PORT : LOCAL_PORT
)

app.use(cors())

app.use(express.static(path.join(__dirname, '..', 'dist')))

const server = app.listen(app.get('port'), () => {
  console.log( // eslint-disable-line no-console
    'Server is running',
    app.get('port'),
    app.get('env')
  )
})

const options = {
  debug: process.env.NODE_ENV === 'development',
}

app.use('/api', peerServer(server, options))
