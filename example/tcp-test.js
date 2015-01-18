var net = require('net')

var server = net.createServer(function(socket) {
  socket.end('hello from tcp server\n')
})

server.listen(10001)