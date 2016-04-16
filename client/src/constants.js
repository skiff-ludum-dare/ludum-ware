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

  WEREWOLF: null,
  VILLAGER: null,

  PAGE_MENU: null,
  PAGE_HOST: null,
  PAGE_JOIN : null,
  PAGE_LOBBY: null,
  PAGE_REVEAL: null,
  PAGE_NIGHT: null,
  PAGE_VOTE: null,
  PAGE_DAY: null,
  PAGE_END: null,

  ERROR: null,

  SHOW_HOST: null,
  SHOW_JOIN: null,

  GAME_STATE_UPDATE: null,
  JOIN_GAME: null,
  CONNECTING: null,
  CONNECTED: null,
  HOST_GAME: null,
  CANCEL: null,
  CHOOSE_VICTIM: null,

});
