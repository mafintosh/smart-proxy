# smart-proxy

smart-proxy is a tcp proxy that allows you to route
tcp connections based on hostnames for ANY protocol

```
npm install smart-proxy
```

## Usage

First start two services, a tcp service and a http service
on two different ports (lets say `10001` and `10002`)

``` js
var net = require('net')
var http = require('http')

var tcpServer = net.createServer(function(socket) {
  socket.end('hello from tcp server\n')
})

tcpServer.listen(10001)

var httpServer = http.createServer(function(req, res) {
  res.end('hello from http server\n')
})

httpServer.listen(10002)
```

Then start the proxy and add the two services.

``` js
var proxy = require('smart-proxy')
var server = proxy()

server.add('tcp-test', 10001, 'localhost')
server.add('http-test, 10002, 'localhost')

server.listen(10000)
```

You can now access each of the two services simply by using `{service-name}.local` as
the dns host and `10000` as the port on the local machine.

``` js
curl http-test.local 10000 # prints hello from http server
nc tcp-test.local 10000 # prints hello from tcp server
```

## How?

smart-proxy using dns to resolve each service name to a unique ip in the `127.x.x.x` range.
All of these addresses should be loopback addresses. When a connection is being proxied it
simply checks which ip was used and proxies to the corresponding service.

Currently [mdns](https://github.com/mafintosh/multicast-dns) is used to resolve the hostnames
since that makes it work without having to setup a new name server on your machine.


## OSX Notice

smart-proxy needs `127.x.x.x` to all be loopback addresses. This *just works* on ubuntu
but on osx you need to run the following command to get this working.

``` sh
#!/bin/bash
for ((i=2;i<256;i++))
do
  sudo ifconfig lo0 alias 127.0.0.$i up
done
```

## License

MIT
