"use strict";
const update = require('react-addons-update');
const _ = require('lodash');
const {without} = require('lodash/fp');
const pi = require('pi');
const c = require('./constants');
const assign = require('lodash/assign');
const reservoir = require('reservoir');

const initialGameState = {
  gameCode: null,
  phase: c.PHASE_LOBBY,
  round: null,
  players: [],
  nomination: null,
};

const WEREWOLVES = 2;

function getRand(seed, len=10) {
  const rand = pi(seed + len + 2).slice(-len);
  return Number("0." +rand);
}

module.exports = function game(gameCode, ownerUserId, seed) {
  const initialState = assign({}, initialGameState, {gameCode});

  return function gameReducer(state=initialState, action) {
    const amount = state.players.length;

    switch(action.type) {

      case c.JOIN_GAME: {
        const {userId, playerName} = action;
        if (state.phase !== c.PHASE_LOBBY) return state;
        if (state.players.indexOf(userId) > -1) return state;

        const player = {
          id: userId,
          name: playerName,
          ready: false,
          online: false,
          toEat: null,
          role: null,
          alive: true,
          owner: userId === ownerUserId,
        };

        return update(state, {
          players: {$push: [player]},
        });

        break;
      }

      case c.START_GAME: {
        if (state.phase !== c.PHASE_LOBBY) return state;
        if (action.userId !== ownerUserId) return state;
        // if (amount < 5) return state;

        const wolves = reservoir(action.wereWolves || WEREWOLVES, _.partial(getRand, seed));
        state.players.forEach(p => {
          wolves.pushSome(p.id);
        });

        const playersWithRoles = state.players.map(v => {
          return assign({}, v, {
            role: wolves.indexOf(v.id) > -1 ? c.WEREWOLF : c.VILLAGER,
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
        const {userId} = action;
        const idx = playerIndex(state, userId);
        const newState = update(state, {
          players: {
            [idx]: { ready: {$set: true} }
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
          const idx = playerIndex(state, nominated);
          if (idx == -1) return state;

          const newNewState = update(newState, {
            players: {[idx]: {alive: {$set: false}}},
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
        const widx = playerIndex(state, wolfUserId);
        const vidx = playerIndex(state, victimUserId);

        if (state.players[widx].role !== c.WEREWOLF) return state;
        if (state.players[vidx].role !== c.VILLAGER) return state;

        const newState = update(state, {
          players: {[widx]: { toEat: {$set: victimUserId} }}
        });

        if (_.every(werewolves(newState), {toEat: victimUserId})) {
          const nextState = update(newState, {
            players: {[vidx]: {alive: {$set: false}}}
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

function playerIndex(state, userId) {
  return _.findIndex(state.players, {id: userId});
}

function werewolves(state) {
  return _.filter(state.players, {role: c.WEREWOLF});
}

function villagers(state) {
  return _.filter(state.players, {role: c.VILLAGER});
}
