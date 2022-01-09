import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8081');

ws.on('open', () => {
  console.log('WebSocket opened')
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log(msg);
});