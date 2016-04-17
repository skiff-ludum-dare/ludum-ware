import io from 'socket.io-client';
import {JOIN_GAME} from './constants';
import EventEmitter from 'events';

const API_CREATE_GAME = `http://${window.location.hostname}:8080/game`;
const SOCKET_IO_ENDPOINT = `http://${window.location.hostname}:8080`;

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
  if (socket) {
    socket.removeListener('message', messageReceived);
    socket.disconnect();
    socket = null;
  }
  sendMessage(userId, gameCode, playerName, JOIN_GAME);
  return new Promise((resolve, reject) => {
    serverEvents.once('gameState', resolve);
  });
}

function messageReceived(message) {
  console.log('MESSAGE', message);
  serverEvents.emit('gameState', JSON.parse(message));
}


export function sendMessage(userId, gameCode, playerName, type, message={}) {
  const payload = {
    ...message,
    type,
    userId,
    playerName,
    gameCode,
  };
  console.log('SEND API MESSAGE', payload);
  if (!socket) {
    connecting = true;
    socket = io(SOCKET_IO_ENDPOINT);
    socket.on('connect', () => {
      socket.send(JSON.stringify(payload));
      connecting = false;
    })
    socket.on('message', messageReceived);
  } else if (connecting) {
    console.log('Already connecting, ignored');
  } else {
    console.log('Sending');
    socket.send(JSON.stringify(payload));
  }
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    connecting = false;
    socket = null;
  }
}
