#!/usr/bin/env node --harmony --harmony_destructuring --harmony_spreadcalls --harmony_object --harmony_rest_parameters --harmony_default_parameters

"use strict"
const url = require('url');
const express = require('express');
const app = express();
const server = require('http').Server(app);
// const WebSocketServer = require('ws').Server;
// const wss = new WebSocketServer({ server: server });
const io = require('socket.io')(server);
io.set( 'origins', '*:*' );

const _ = require('lodash');
const uuid = require('uuid');
const c = require('./constants');
const extend = require('lodash/fp/extend');
const game = require('./game');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(cors());
app.use(bodyParser.json());
app.options('*', cors());

const playerMap = {};
let games = {};
try {
  games = require('./gamestate.json');
} catch (ex) {
  console.log('no game state found');
}

function findGame(userId) {
  _.each(games, (v, k) => {
    if (v.players.indexOf(userId) > -1) {
      return k;
    }
  });
  return null;
}

process.on('SIGINT', () => {
  // write out gamestates
  fs.writeFile('gamestate.json', JSON.stringify(games), (err) => {
    console.log('saving gamestate...');
    process.exit();
  });
});

function createGame(userId) {
  const code = String.fromCharCode(..._.range(4).map(x => _.random(65, 90)));
  const reducer = game(code, userId, _.random(1, 1000));
  const state = reducer(undefined, {});

  return games[code] = {
    update: (action) => games[code].state = reducer(games[code].state, action),
    state,
  };
}

io.on('connection', function connection(socket) {
  socket.on('message', function incoming(plain) {
    console.log('received: %s', plain);
    let message = {};

    try {
      message = JSON.parse(plain);
    } catch(e) {
      console.log('invalid command: %s', plain);
      socket.send(JSON.stringify({error: 'invalid message packet'}));
      return;
    }

    if (!message.userId) {
      socket.send(JSON.stringify({error: 'need userId'}));
      return;
    }

    // FIXME: leaky
    playerMap[message.userId] = socket;

    if (c[message.type]) {
      //dispatch
      if (message.type === c.CREATE_GAME) {
        console.log('deprecated');
        const {state} = createGame(message.userId);
        socket.send(JSON.stringify(state));
        return;

      } else {

        if (!message.gameCode || !games[message.gameCode]) {
          socket.send(JSON.stringify({error: 'supply a gamecode or game not found'}));
          return;
        }

        const {update, state} = games[message.gameCode];
        const newState = update(message);

        console.log('Sending:', newState);
        newState.players.forEach( ({id}) => {
          const client = playerMap[id];
          client.send(JSON.stringify(newState));
        });

        return
      }
    } else {
      console.log('unknown command: %s', message.type);
      socket.send(JSON.stringify({error: 'unknown command'}));
      return
    }
  });

});

app.post('/game', (req, res) => {
  if (!req.body.userId) {
    res.status(400).send('need userId');
    return
  }

  const {state} = createGame(req.body.userId);
  res.json(state);
});

// server.on('request', app);
server.listen(8080, function () { console.log('Listening on ' + server.address().port) });
