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

function lobbyReducer(state, action) {
  switch(action.type) {
  case c.START_GAME: {
    if (action.userId !== state.ownerUserId) return state;
    // if (amount < 5) return state;

    const wolves = reservoir(action.wereWolves || WEREWOLVES, _.partial(getRand, state.seed));
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
  }
  return state;
}

function revealReducer(state, action) {
  switch(action.type) {
  case c.REVEAL_READY: {
    const {userId} = action;
    const idx = playerIndex(state, userId);
    const newState = update(state, {
      players: {
        [idx]: { ready: {$set: true} }
      },
    });

    if (_.every(newState.players, {ready: true})) {
      //all ready
      return update(newState, {
        phase: {$set: c.PHASE_DAY},
        players: {$set: state.players.map(p => _.extend({}, p, {victimUserId: null}))},
      });
    } else {
      return newState;
    }

    break;
  }
  }
  return state;
}

function voteInfo(state) {
  const isNight = (state.phase === c.PHASE_NIGHT);
  const voters = isNight ? werewolves(state) : living(state);
  const targets = isNight ? villagers(state) : living(state);
  const votesNeeded = isNight ? voters.length : Math.ceil(voters.length / 2);
  return {votes, targets, votesNeeded};
}

function dayOrNightReducer(state, action) {
  const isNight = (state.phase === c.PHASE_NIGHT);
  let {votes, targets, votesNeeded} = voteInfo(state);

  state = {...state, votesNeeded};

  switch(action.type) {
  case c.UNSELECT_VICTIM: {
    const pidx = playerIndex(state, action.userId);
    return update(state, {
      players: {[pidx]: { victimUserId: {$set: null} }}
    });
  }
  case c.SELECT_VICTIM: {
    const {victimUserId} = action;;
    const vidx = playerIndex(state, victimUserId);
    const pidx = playerIndex(state, action.userId);

    state = update(state, {
      players: {[pidx]: { victimUserId: {$set: victimUserId} }}
    });

    // Recaluclate voters and targets
    let {votes, targets, votesNeeded} = voteInfo(state);

    if (_.find(voters, {id: action.userId}) && _.find(targets, {id: victimUserId})) {
      console.log('VALID SELECT');

      if (_.filter(voters, {victimUserId}).length >= votesNeeded) {
        console.log('DIE', victimUserId);
        state = update(state, {
          players: {[vidx]: { alive: {$set: false} }}
        });

        // Check for win/lose
        const villagersWin = werewolves(state).length === 0;
        const wolvesWin = werewolves(state).length >= villagers(state).length;

        console.log('WIN', villagersWin, wolvesWin);

        // Move to next phase
        if (villagersWin || wolvesWin) {
          state = update(state, {
            phase: {$set: c.PHASE_END},
            winner: {$set: villagersWin ? "villagers" : "wolves"},
          });
        } else {
          state = update(state, {
            phase: {$set: isNight ? c.PHASE_DAY : c.PHASE_NIGHT},
            players: {$set: state.players.map(p => _.extend({}, p, {victimUserId: null}))},
          });
        }
      }
    }

    return state;
  }
  }
  return state;
}

module.exports = function game(gameCode, ownerUserId, seed) {
  const initialState = assign({}, initialGameState, {gameCode, ownerUserId, seed});

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
          victimUserId: null,
          role: null,
          alive: true,
          owner: userId === state.ownerUserId,
        };

        state = update(state, {
          players: {$push: [player]},
        });

        break;
      }
    }

    switch (state.phase) {
    case c.PHASE_LOBBY:
      return lobbyReducer(state, action);
    case c.PHASE_REVEAL:
      return revealReducer(state, action);
    case c.PHASE_DAY:
    case c.PHASE_NIGHT:
      return dayOrNightReducer(state, action);
    }

    return state;
  }
}

function playerIndex(state, userId) {
  return _.findIndex(state.players, {id: userId});
}

function living(state) {
  return _.filter(state.players, {alive: true});
}

function werewolves(state) {
  return _.filter(state.players, {role: c.WEREWOLF, alive: true});
}

function villagers(state) {
  return _.filter(state.players, {role: c.VILLAGER, alive: true});
}
