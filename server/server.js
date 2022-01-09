import WebSocket, { WebSocketServer } from 'ws';
import { connect } from 'mqtt';

const mqtt = connect('mqtt://k34.mine.nu');

const wss = new WebSocketServer({ port: 8081 });
console.log('serving on port 8081')

wss.on('connection', (ws) => {
  ws.isAlive = true
  ws.on('pong', function () {
    this.isAlive = true;
  });
  console.log('client connected', new Date().toLocaleString('sv-SE'));
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('terminating dead client');
      return ws.terminate();
    };
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

const topics = [
  'k34/bmp085', 
  'k34/matsal', 
  'k34/temparkiv', 
  'k34/tempgarage', 
  'k34/tempout'
];

mqtt.on('connect', () => {
  topics.forEach((topic) => {
    mqtt.subscribe(topic);
    console.log('subscribing to', topic)
  });
});

mqtt.on('message', (topic, message) => {
  const data = JSON.stringify({
    topic: topic,
    payload: JSON.parse(message.toString())
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
});