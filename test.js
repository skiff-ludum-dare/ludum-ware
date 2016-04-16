#!/usr/bin/env mocha --harmony --harmony_destructuring --harmony_spreadcalls --harmony_object --harmony_rest_parameters
var assert = require('chai').assert;
const c = require('./constants');
const game = require('./game');

const reducer = game('TEST', 1, 1);

describe('gameState', function() {
  describe(c.START_GAME, function () {
    it('has sensible default state', () => {
      assert.deepEqual(reducer(null, {}), {
        gameCode: 'TEST',
        phase: "lobby",
        round: null,
        players: {},
        nomination: null,
      });
    });
  });
});
