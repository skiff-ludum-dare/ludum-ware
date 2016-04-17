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
      phase: c.PHASE_LOBBY,
      round: null,
      players: [],
      nomination: null,
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

  const revealState = reducer(readyState, {
    type: c.REVEAL_READY,
    userId: 'p3',
  });

  it(c.REVEAL_READY, () => {
    assert.equal(revealState.players[3].ready, true);
  });

  const nominateState = reducer(revealState, {
    type: c.NOMINATE,
    nominatedUserId: 'p3',
    accuserUserId: 'p4',
  });

  const lynchedState = _.reduce(_.range(3), (state, userId) => {
    return reducer(state, {
      type: c.VOTE_YES,
      userId: 'p' + userId,
    });
  }, nominateState);

  it(c.VOTE_YES, () => {
    assert.equal(lynchedState.players[3].alive, false);
    assert.equal(lynchedState.phase, c.PHASE_NIGHT);
  });

  const savedState = _.reduce(_.range(3), (state, userId) => {
    return reducer(state, {
      type: c.VOTE_NO,
      userId: 'p' + userId,
    });
  }, nominateState);

  it(c.VOTE_NO, () => {
    assert.equal(savedState.players[3].alive, true);
  });

  const werewolves = _.filter(lynchedState.players, {role: c.WEREWOLF});

  const devouredState = _.reduce(werewolves, (state, player) => {
    return reducer(state, {
      type: c.DEVOUR,
      wolfUserId: player.id,
      victimUserId: 'p1',
    });
  }, lynchedState);

  it(c.DEVOUR, () => {
    assert.equal(devouredState.players[1].alive, false);
    assert.equal(devouredState.phase, c.PHASE_DAY);
  });

});
