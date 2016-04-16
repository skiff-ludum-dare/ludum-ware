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

const players = {};

const games = {};

function createPlayer(name) {
  return players.push({
    id: uuid.v4(),
    name,
  });
}

function findGame(clientId) {
  _.each(games, (v, k) => {
    if (v.players.indexOf(clientId) > -1) {
      return k;
    }
  });
  return null;
}

function createGame(clientId) {
  const code = String.fromCharCode(..._.range(4).map(x => _.random(65, 90)));
  const reducer = game(code, clientId, _.random(1, 1000));
  const state = reducer(undefined, {});

  return games[code] = {
    update: (action) => games[code].state = reducer(games[code].state, action),
    state,
  };
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(plain) {
    console.log('received: %s', plain);
    let message = {};

    try {
      message = JSON.parse(plain);
    } catch(e) {
      console.log('invalid command: %s', plain);
      ws.send('invalid message packet');
      return;
    }

    if (!message.clientId) {
      ws.send('need clientId');
      return;
    }

    if (c[message.type]) {
      //dispatch
      if (message.type === c.CREATE_GAME) {
        const {state} = createGame(message.clientId);
        ws.send(JSON.stringify(state));
        return;
      } else {

        if (!message.gameCode || !games[message.gameCode]) {
          ws.send('need gameCode to do game ops or game not found');
          return;
        }

        const {update, state} = games[message.gameCode];
        const newState = update(message);
        ws.send(JSON.stringify(newState));
        return
      }
    } else {
      console.log('unknown command: %s', message.type);
      ws.send('unknown command');
      return
    }
  });

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
