import { db } from './db';
import http from 'http'

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!');
});

db.$subscribe((anyModelChanged) => {
  console.log({ anyModelChanged })
}, {
  logLevel: "all"
})

db.snakeInDb.$subscribe((snakeSubscribed) => {
  console.log({ snakeSubscribed })
})

const hostname = '0.0.0.0';
const port = 3000;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err, 'error')
})