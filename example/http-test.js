var http = require('http')

var server = http.createServer(function(req, res) {
  res.end('hello from http server\n')
})

server.listen(10002)