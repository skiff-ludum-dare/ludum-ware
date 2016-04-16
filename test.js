#!/usr/bin/env mocha --harmony --harmony_destructuring --harmony_spreadcalls --harmony_object --harmony_rest_parameters --harmony_default_parameters
var assert = require('chai').assert;
const c = require('./constants');
const game = require('./game');
const _ = require('lodash');

const reducer = game('TEST', 'test', 50);

describe('gameState', function() {
  const initialState = reducer(undefined, {});
  it('has sensible default state', () => {
    assert.deepEqual(initialState, {
      gameCode: 'TEST',
      phase: c.PHASE_LOBBY,
      round: null,
      players: {},
      nomination: null,
    });
  });

  it(c.JOIN_GAME, () => {
    assert.equal(
      reducer(initialState, {
        type: c.JOIN_GAME,
        playerId: 'test',
        name: 'me',
      }).players.test.owner, true
    );
  });

  const fullState = _.reduce(_.range(6), (state, playerId) => {
    return reducer(state, {
      type: c.JOIN_GAME,
      playerId: 'p' + playerId,
      name: playerId
    });
  }, undefined);

  const readyState = reducer(fullState, {
    type: c.START_GAME,
    playerId: 'test',
  });

  it(c.START_GAME, () => {
    assert.equal(Object.keys(fullState.players).length, 6);

    assert.equal(
      readyState.players.p0.role, 'villager'
    );
  });

  const revealState = reducer(readyState, {
    type: c.REVEAL_READY,
    userId: 'p3',
  });

  it(c.REVEAL_READY, () => {
    assert.equal(revealState.players.p3.ready, true);
  });

});
