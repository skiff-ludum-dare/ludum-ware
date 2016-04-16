"use strict";
const update = require('react-addons-update');
const _ = require('lodash');
const {without} = require('lodash/fp');
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
    const amount = Object.keys(state.players).length;

    switch(action.type) {

      case c.JOIN_GAME: {
        const {playerId, name} = action;
        if (state.phase !== c.PHASE_LOBBY) return state;
        if (!(playerId in state.players)) {

          const player = {
            id: playerId,
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
        break;
      }

      case c.START_GAME: {
        if (state.phase !== c.PHASE_LOBBY) return state;
        if (action.playerId !== ownerPlayerId) return state;
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
            role: found.indexOf(i++) > -1 ? c.WEREWOLF : c.VILLAGER,
          });
        });

        return update(state, {
          players: {$set: playersWithRoles},
          phase: {$set: c.PHASE_REVEAL},
        });

        break;
      }

      case c.REVEAL_READY: {
        if (state.phase !== c.PHASE_REVEAL) return state;
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
        if (state.phase !== c.PHASE_DAY) return state;
        const {nominatedUserId, accuserUserId} = action;
        if (!nominatedUserId || !accuserUserId) {
          throw new Error('missing stuff');
        }

        return update(state, {
          phase: {$set: c.PHASE_VOTE},
          nomination: {
            $set: {
              nominatedUserId: nominatedUserId,
              accuserUserId: accuserUserId,
              yesVotes: [accuserUserId],
              noVotes: [],
            }
          }
        });
        break;
      }

      case c.VOTE_YES: {
        if (state.phase !== c.PHASE_VOTE) return state;
        const {userId} = action;
        if (state.nomination.yesVotes.indexOf(userId) > -1 ) return state;

        const nominated = state.nomination.nominatedUserId;

        if (userId === nominated) return state;

        const newState = update(state, {
          nomination: {
            yesVotes: {$push: [userId]},
            noVotes: {$apply: without(userId)},
          }
        });

        if (newState.nomination.yesVotes.length > amount/2) {
          const newNewState = update(newState, {
            players: {
              [nominated]: {
                alive: {$set: false},
              },
            },
            nomination: {$set: null},
            phase: {$set: c.PHASE_DAY},
          });

          const nextPhase =
            _.some(werewolves(newNewState), {alive: true})
            ? c.PHASE_NIGHT : c.PHASE_END;

          return update(newNewState, {
            phase: {$set: nextPhase},
          });
        }

        return newState;
        break;
      }

      case c.VOTE_NO: {
        if (state.phase !== c.PHASE_VOTE) return state;
        const {userId} = action;
        if (state.nomination.noVotes.indexOf(userId) > -1 ) return state;

        const newState = update(state, {
          nomination: {
            noVotes: {$push: [userId]},
            yesVotes: {$set: without(userId)},
          }
        });
        if (newState.nomination.noVotes.length > amount/2) {
          return update(newState, {
            nomination: {$set: null},
            phase: {$set: c.PHASE_DAY},
          });
        }

        return newState;
        break;
      }

      case c.DEVOUR: {
        if (state.phase !== c.PHASE_NIGHT) return state;

        const {wolfUserId, victimUserId} = action;
        if (state.players[wolfUserId].role !== c.WEREWOLF) return state;
        if (state.players[victimUserId].role !== c.VILLAGER) return state;

        const newState = update(state, {
          players: {[wolfUserId]: {
            toEat: {$set: victimUserId}
          }}
        });

        if (_.every(werewolves(newState), {toEat: victimUserId})) {
          const nextState = update(newState, {
            players: {[victimUserId]: {
              alive: {$set: false}
            }}
          });
          if (_.every(villagers(nextState), {alive: false})) {
            return update(nextState, {
              phase: {$set: c.PHASE_END},
            });
          }

          return update(nextState, {
            phase: {$set: c.PHASE_DAY},
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
  return _.filter(state.players, {role: c.WEREWOLF});
}

function villagers(state) {
  return _.filter(state.players, {role: c.VILLAGER});
}
