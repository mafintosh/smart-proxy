var net = require('net')
var pump = require('pump')
var network = require('network-address')
var multicast = require('multicast-dns')

var tick = 0

module.exports = function() {
  var services = {}
  var hosts = {}
  var mdns = multicast()
  var me = network()

  mdns.on('query', function(query, rinfo) {
    if (rinfo.address !== me) return

    query.questions.forEach(function(q) {
      var service = services[q.name] || services[q.name.replace(/\.local$/, '')]

      if (!service || !service.bind) return
      if (q.type !== 'A') return

      mdns.respond({
        answers: [{
          type: 'A',
          ttl: 5,
          name: q.name,
          data: service.bind
        }],
        additionals: [{
          type: 'AAAA', // seems AAAA record makes caching work with mdns
          ttl: 5,
          name: q.name,
          data: 'fe80::1' // just resolve to localhost - won't be used
        }]
      })
    })
  })

  var freeHost = function() {
    for (var i = 0; i < 255; i++) { // TODO: generate 127.x.x.x as well etc
      if (tick === 255) tick = 0
      var host = '127.0.0.'+(++tick)
      if (!hosts[host]) return host
    }
    return null
  }

  var server = net.createServer(function(socket) {
    var addr = socket.address().address
    var service = hosts[addr]

    if (!service) return socket.destroy()

    server.emit('route', service)
    pump(socket, net.connect(service.port, server.host), socket)
  })

  server.add = function(name, port, host) {
    var addr = freeHost()
    hosts[addr] = services[name] = {bind:addr, port:port, host:host || 'localhost'}
  }

  server.remove = function(name) {
    var addr = services[name] && services[name].bind
    delete services[name]
    delete hosts[addr]
  }

  return server
}