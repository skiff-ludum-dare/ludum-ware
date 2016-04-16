"use strict";
const update = require('react-addons-update');
const _ = require('lodash');
const pi = require('pi');
const c = require('./constants');
const assign = require('lodash/assign');
const initialGameState = {
  gameCode: null,
  phase: c.PHASE_LOBBY,
  round: null,
  players: {},
  nomination: null,
};

const WEREWOLVES = 2;

function joinGame(state, action, ownerPlayerId) {
  const {playerId, name} = action;
  if (state.phase !== c.PHASE_LOBBY) return state;
  if (!(playerId in state.players)) {

    const player = {
      name,
      ready: false,
      online: false,
      toEat: null,
      role: null,
      alive: true,
      owner: playerId === ownerPlayerId,
    };

    return update(state, {
      players: { [playerId]: {$set: player}}
    });
  }

  return state;
}

function getRand(seed, len=10) {
  let rand = null;
  do {
    rand = pi(seed + len + 2).slice(-len);
  } while (rand.charAt(0) === "0");
  return Number(rand);
}

module.exports = function game(gameCode, ownerPlayerId, seed) {
  const initialState = assign({}, initialGameState, {gameCode});

  return function gameReducer(state=initialState, action) {
    switch(action.type) {

      case c.JOIN_GAME: {
        return joinGame(state, action, ownerPlayerId);
        break;
      }

      case c.START_GAME: {
        if (state.phase !== c.PHASE_LOBBY) return state;
        if (action.playerId !== ownerPlayerId) return state;
        const amount = Object.keys(state.players).length;
        if (amount < 5) return state;

        const found = [];
        //
        do {
          const rand = getRand(seed + found.length, 6);
          found.push(Math.floor(amount / (1000000 / rand)));
        } while (found.length < WEREWOLVES);

        let i = 0;
        const playersWithRoles = _.mapValues(state.players, (v, k) => {
          return assign({}, v, {
            role: found.indexOf(i++) > -1 ? 'werewolf' : 'villager',
          });
        });

        return update(state, {
          players: {$set: playersWithRoles},
          phase: {$set: c.PHASE_REVEAL},
        });

        break;
      }

      case c.REVEAL_READY: {
        const newState = update(state, {
          players: {
            [action.userId]: { ready: {$set: true} }
          },
          phase: {$set: c.PHASE_DAY},
        });

        if (_.every(newState.players, {ready: true})) {
          //all ready
          return update(newState, {
            nomination: {$set: null},
            phase: {$set: c.PHASE_VOTE},
          });
        } else {
          return newState;
        }

        break;
      }

      case c.NOMINATE: {
        break;
      }

      case c.VOTE_YES: {
        break;
      }

      case c.VOTE_NO: {
        break;
      }

      case c.DEVOUR: {
        const {wolfUserId, victimUserId} = action;
        if (state.phase !== c.PHASE_NIGHT) return state;
        if (state.players[wolfUserId].role !== 'werewolf') return state;
        if (state.players[victimUserId].role !== 'villager') return state;

        const newState = update(state, {
          players: {[wolfUserId]: {
            toEat: {$set: victimUserId
          }}}
        });

        if (_.all(werewolves(newState), {toEat: victimUserId})) {
          const nextState = update(newState, {
            players: {[victimUserId]: {
              alive: {$set: false}
            }}
          });
          if (_.all(villagers(nextState), {alive: false})) {
            return update(nextState, {
              phase: c.PHASE_END,
            });
          }

          return update(nextState, {
            phase: c.PHASE_DAY,
          });

        } else {
          return newState;
        }
        break;
      }

      default:
        return state;

    }
    return state;
  }
}

function werewolves(state) {
  return _.find(state.players, {role: 'werewolf'});
}
