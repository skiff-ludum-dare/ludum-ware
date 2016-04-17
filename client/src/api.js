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
    serverEvents.once('gameState', gameState => {
      resolve(gameState);
    });
  });
}

export function sendMessage(userId, gameCode, type, message={}) {
  const payload = {
    ...message,
    type,
    userId,
    gameCode,
  };
  if (!socket) {
    queue.push(payload);
    connecting = true;
    socket = io(SOCKET_IO_ENDPOINT);
    socket.on('connect', () => {
      queue.map(m => socket.send(JSON.stringify(m)));
    })
    socket.on('message', gameState => {
      serverEvents.emit('gameState', gameState);
    });
    queue = [];
  } else if (connecting) {
    queue.push(payload);
  } else {
    socket.send(JSON.stringify(payload));
  }
}
