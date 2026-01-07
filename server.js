// super-light SOCKS5 server (no auth, 1 file)
const socks = require('simple-socks');
const server = socks.createServer();
server.listen(process.env.PORT || 8080, '0.0.0.0', () =>
  console.log('SOCKS5 listening on', server.address().port)
);
