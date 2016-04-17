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
  showNarrative: false,
  round: null,
  players: [],
};

const WEREWOLVES = 1;

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
        ready: false,
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
  case c.READY: {
    const {userId} = action;
    const idx = playerIndex(state, userId);
    console.log('REVEAL READY', userId, idx);
    console.log(_.map(state.players, 'ready'));
    const newState = update(state, {
      players: {
        [idx]: { ready: {$set: true} }
      },
    });
    console.log(_.map(newState.players, 'ready'));

    if (_.every(newState.players, {ready: true})) {
      console.log('ALL READY');
      //all ready
      return update(newState, {
        round: {$set: 1},
        phase: {$set: c.PHASE_DAY},
        showNarrative: {$set: true},
        players: {$set: state.players.map(p => _.extend({}, p, {victimUserId: null, ready: false}))},
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
  return {voters, targets, votesNeeded};
}

function dayOrNightReducer(state, action) {
  if (state.showNarrative) {
    if (action.type === c.READY) {
      console.log('MARK READY', action.userId);
      console.log(_.map(state.players, 'ready'));
      state = _.extend({}, state, {players: state.players.map(p => (p.id === action.userId) ? _.extend({}, p, { ready: true}) : p)});
      console.log(_.map(state.players, 'ready'));
      if (_.every(living(state), p => p.ready)) {
        console.log('EVERYONE IS READY');
        return update(state, {
          showNarrative: {$set: false},
          players: {$set: state.players.map(p => _.extend({}, p, {ready: false}))},
        });
      }
    }
    return state;
  }

  const isNight = (state.phase === c.PHASE_NIGHT);
  let {voters, targets, votesNeeded} = voteInfo(state);

  state = _.extend({}, state, {votesNeeded});

  switch(action.type) {
  case c.UNSELECT_VICTIM: {
    const pidx = playerIndex(state, action.userId);
    return update(state, {
      players: {[pidx]: { victimUserId: {$set: null} }}
    });
  }
  case c.SELECT_VICTIM: {
    const {victimUserId, userId} = action;
    const vidx = playerIndex(state, victimUserId);
    const pidx = playerIndex(state, userId);

    state = update(state, {
      players: {[pidx]: { victimUserId: {$set: victimUserId} }}
    });

    // Recaluclate voters and targets
    let {voters, targets, votesNeeded} = voteInfo(state);

    if (_.find(voters, {id: action.userId}) && _.find(targets, {id: victimUserId})) {
      if (_.filter(voters, {victimUserId}).length >= votesNeeded) {
        state = update(state, {
          lastVictimUserId: {$set: victimUserId},
          players: {[vidx]: { alive: {$set: false} }}
        });

        // Check for win/lose
        const villagersWin = werewolves(state).length === 0;
        const wolvesWin = werewolves(state).length >= villagers(state).length;

        // console.log('werewolves', werewolves(state), werewolves(state).length);
        // console.log('villagers', villagers(state), villagers(state).length);
        // console.log('WIN', villagersWin, wolvesWin);
        //
        // Move to next phase
        if (villagersWin || wolvesWin) {
          state = update(state, {
            phase: {$set: c.PHASE_END},
            winner: {$set: villagersWin ? c.VILLAGER: c.WEREWOLVES},
          });
        } else {
          state = update(state, {
            round: {$set: isNight ? state.round + 1 : state.round },
            phase: {$set: isNight ? c.PHASE_DAY : c.PHASE_NIGHT},
            showNarrative: {$set: true},
            players: {$set: state.players.map(p => _.extend({}, p, {victimUserId: null, ready: false}))},
          });
        }
      }
    }

    return state;
  }
  }
  return state;
}

function endReducer(state, action) {
  switch(action.type) {
  case c.READY: {
    state = _.extend({}, state, {players: state.players.map(p => (p.id === action.userId) ? _.extend({}, p, { ready: true}) : p)});
    if (_.every(state.players, p => p.ready)) {
      return _.extend({}, state, {
        phase: c.PHASE_LOBBY,
        showNarrative: false,
        round: null,
        seed: state.seed + 1,
        players: state.players.map(p => _.extend({}, p, {
          ready: false,
          alive: true,
          victimUserId: null,
        })),
      });
    }
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
        if (_.find(state.players, {id:userId})) return state;

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
    case c.PHASE_END:
      return endReducer(state, action);
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
