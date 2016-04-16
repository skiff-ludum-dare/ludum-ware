const pi = require('pi');
const c = require('./constants');
const assign = require('lodash/assign');
const initialGameState = {
  gameCode: null,
  phase: "lobby",
  round: null,
  players: {},
  nomination: null,
};

module.exports = function game(gameCode, ownerPlayerId, seed) {

  return function gameReducer(maybeState, action) {
    const state = assign({}, maybeState, initialGameState, {gameCode});

    const {playerId} = action;
    switch(action.type) {
      case c.JOIN_GAME: {
        if (state.phase !== c.PHASE_LOBBY) return state;
        const {name} = action;
        if (!(playerId in state.players)) {

          const player = {
            name,
            owner: playerID === ownerPlayerId,
          };

          return assign({},
            state, {
              players: assign({}, state.players, {[playerId]: player})
            }
          );
        }
        break;
      }

      case c.START_GAME: {
        if (state.phase !== c.PHASE_LOBBY) return state;
        if (playerId !== ownerPlayerId) return state;
        // TODO: Assign roels DETERMINISTICALLY based on seed
        break;
      }
    }
    return state;
  }
}

