#!/usr/bin/env node --harmony --harmony_destructuring --harmony_spreadcalls --harmony_object --harmony_rest_parameters --harmony_default_parameters

// const express = require('express');
// const app = express();
"use strict"
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 8080 });
const _ = require('lodash');
const uuid = require('uuid');
const c = require('./constants');
const extend = require('lodash/fp/extend');
const game = require('./game');

const players = {
};

const games = {
  _example: {
    gameCode: "FLUBLE",
    phase: "lobby/reveal/day/night/",
    round: "null/1/2/3/4",
    players: {
      ID1: {
        id: 'ID1',
        role: "villager/wolf",
        alive: "true/false",
      },
    },
  },
};

function createPlayer(name) {
  return players.push({
    id: uuid.v4(),
    name,
  });
}

function createGame() {
  const code = String.fromCharCode(..._.range(4).map(x => _.random(65, 90)));
  games[code] = {
    phase: 'lobby',
    round: null,
    players: {},
  }
  return code;
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(plain) {
    console.log('received: %s', plain);
    try {
      const message = JSON.parse(plain);
      if (c[message.type]) {
        //dispatch
        game(message.gameCode, message.playerId)
      } else {
        console.log('unknown command: %s', message.type);
      }
    } catch(e) {
      console.log('invalid command: %s', plain);
    }
  });

  ws.send('something');
});

// app.post('/game', (req, res) => {
//   const id = createGame();
//   res.redirect(303, '/game/' + id);
// });
//
// app.get('/game/:game_id', (req, res) => {
//   const game = games[req.params.game_id];
//   res.json(game);
// });
//
// app.post('/player', (req, res) => {
//   res.json(createPlayer());
// });
//
// app.get('/player', (req, res) => {
// });
//
// app.listen(3000, () => {
//   console.log('werewolf listening on port 3000!');
// });
