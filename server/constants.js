const keyMirror = require('key-mirror');

module.exports = keyMirror({
  PHASE_LOBBY: null,
  PHASE_REVEAL: null,
  PHASE_DAY: null,
  PHASE_VOTE: null,
  PHASE_NIGHT: null,
  PHASE_END: null,

  CREATE_GAME: null,
  START_GAME: null,
  JOIN_GAME: null,
  REVEAL_READY: null,
  NOMINATE: null,
  VOTE_YES: null,
  VOTE_NO: null,
  DEVOUR: null,
  UPDATE_STATE: null,
});
