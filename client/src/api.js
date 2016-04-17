import io from 'socket.io-client';
import {JOIN_GAME} from './constants';
import EventEmitter from 'events';

const API_CREATE_GAME = `http://${window.location.hostname}:8080/game`;
const SOCKET_IO_ENDPOINT = `http://${window.location.hostname}:8080`;

let queue = [];
let socket = null;
let connecting = false;

export const serverEvents = new EventEmitter();

export async function hostGame(userId, playerName) {
  const response = await fetch(API_CREATE_GAME, {
    method: 'POST',
    body: JSON.stringify({userId}),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });
  const data = await response.json();
  return await joinGame(userId, playerName, data.gameCode);
}

export function joinGame(userId, playerName, gameCode) {
  queue = [];
  sendMessage(userId, gameCode, JOIN_GAME, {playerName});
  return new Promise((resolve, reject) => {
    serverEvents.once('gameState', resolve);
  });
}

export function sendMessage(userId, gameCode, type, message={}) {
  const payload = {
    ...message,
    type,
    userId,
    gameCode,
  };
  console.log('SEND API MESSAGE', payload);
  if (!socket) {
    console.log('Add to queue (1)');
    queue.push(payload);
    connecting = true;
    socket = io(SOCKET_IO_ENDPOINT);
    console.log('>QUEUE', queue);
    socket.on('connect', () => {
      console.log('QUEUE', queue);
      queue.map(m => socket.send(JSON.stringify(m)));
      queue = [];
      connecting = false;
    })
    socket.on('message', gameState => {
      console.log('MESSAGE', gameState);
      serverEvents.emit('gameState', JSON.parse(gameState));
    });
  } else if (connecting) {
    console.log('Add to queue (2)');
    queue.push(payload);
  } else {
    console.log('Send right away');
    socket.send(JSON.stringify(payload));
  }
}
