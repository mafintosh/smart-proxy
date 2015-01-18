var router = require('../')

var server = router()

server.add('tcp-server', 10001)
server.add('http-server', 10002)

server.listen(10000)
