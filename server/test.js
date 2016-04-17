#!/usr/bin/env mocha --harmony --harmony_destructuring --harmony_spreadcalls --harmony_object --harmony_rest_parameters --harmony_default_parameters
var assert = require('chai').assert;
const c = require('./constants');
const game = require('./game');
const _ = require('lodash');

const reducer = game('TEST', 'test', 50);

describe('gameState', function() {
  const initialState = reducer(undefined, {});
  it('initial state', () => {
    assert.deepEqual(initialState, {
      gameCode: 'TEST',
      seed: 50,
      ownerUserId: "test",
      phase: c.PHASE_LOBBY,
      round: null,
      players: [],
      showNarrative: false,
    });
  });

  it(c.JOIN_GAME, () => {
    assert.equal(
      reducer(initialState, {
        type: c.JOIN_GAME,
        userId: 'test',
        playerName: 'me',
      }).players[0].owner, true
    );
  });

  const fullState = _.reduce(_.range(6), (state, userId) => {
    return reducer(state, {
      type: c.JOIN_GAME,
      userId: 'p' + userId,
      playerName: 'ms '+ userId
    });
  }, undefined);

  const randomTest = reducer(fullState, {
    type: c.START_GAME,
    userId: 'test',
    wereWolves: 7,
  });

  it('RANDOM', () => {
    assert.isTrue(_.every(randomTest.players, {role: c.WEREWOLF}));
  });

  const readyState = reducer(fullState, {
    type: c.START_GAME,
    userId: 'test',
  });

  it(c.START_GAME, () => {
    assert.equal(fullState.players.length, 6);

    assert.equal(
      readyState.players[1].role, c.VILLAGER
    );
  });

  it(c.PLAYER_PRESENCE, () => {
    assert.equal(reducer(readyState, {
      type: c.PLAYER_PRESENCE,
      userId: 'p0',
      online: false,
    }).players[0].online, false);
  });

  const revealReadyState = clearNarrative(readyState);

  it(c.READY, () => {
    assert.equal(revealReadyState.players[0].ready, true);
    assert.equal(revealReadyState.phase, c.PHASE_DAY);
  });

  const gameState = clearNarrative(revealReadyState);

  const lynchedState = _.reduce(_.range(4), (state, userId) => {
    return reducer(state, {
      type: c.SELECT_VICTIM,
      victimUserId: 'p2',
      userId: 'p' + userId,
    });
  }, gameState);

  it(c.SELECT_VICTIM, () => {
    assert.equal(lynchedState.players[2].alive, false);
    assert.equal(lynchedState.phase, c.PHASE_NIGHT);
  });

  const werewolves = _.filter(lynchedState.players, {role: c.WEREWOLF});

  const devouredState = _.reduce(werewolves, (state, player) => {
    return reducer(state, {
      type: c.SELECT_VICTIM,
      victimUserId: 'p1',
      userId: player.id,
    });
  }, clearNarrative(lynchedState));

  it(c.DEVOUR, () => {
    assert.equal(devouredState.players[1].alive, false);
    assert.equal(devouredState.winner, c.WEREWOLF);
    assert.equal(devouredState.phase, c.PHASE_END);
  });

});

function clearNarrative(state) {
  return _.reduce(_.range(6), (state, userId) => {
    return reducer(state, {
      type: c.READY,
      userId: 'p' + userId,
    });
  }, state);
}
