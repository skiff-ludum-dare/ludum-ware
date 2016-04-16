'use strict';
export const PAGE_MENU = "PAGE_MENU";
export const PAGE_HOST = "PAGE_HOST";
export const PAGE_JOIN = "PAGE_JOIN";
export const PAGE_LOBBY = "PAGE_LOBBY";
export const PAGE_REVEAL = "PAGE_REVEAL";
export const PAGE_NIGHT = "PAGE_NIGHT";
export const PAGE_VOTE  = "PAGE_VOTE";
export const PAGE_DAY = "PAGE_DAY";
export const PAGE_END = "PAGE_END";

const initialState = {
  page: PAGE_MENU,
  playerId: "1",
  game: {
    gameCode: "MYGAME",
    players: [
      {id: '1', name: 'Captain Tom', owner: true},
      {id: '2', name: 'Delta Foxtrot'},
      {id: '3', name: 'Lt. Crispin'},
      {id: '4', name: 'Yann'},
    ],
    nomination: {
      nominatedUserId: '1',
      accuserUserId: '2',
    }
  },
};

const SHOW_HOST = 'SHOW_HOST';
const SHOW_JOIN = 'SHOW_JOIN';


const JOIN_GAME = "JOIN_GAME";
const HOST_GAME = "HOST_GAME";
const CANCEL = "CANCEL";
const CHOOSE_VICTIM = "CHOOSE_VICTIM";

const START_GAME = "START_GAME";
const REVEAL_READY = "REVEAL_READY";
const NOMINATE = "NOMINATE";
const VOTE_YES = "VOTE_YES";
const VOTE_NO = "VOTE_NO";
const DEVOUR = "DEVOUR";

const GAME_STATE_UPDATE = "GAME_STATE_UPDATE";

export function reducer(state=initialState, action) {


  if (action.type === GAME_STATE_UPDATE) {
    return {...state, game: action.game};
  }

  switch (state.page) {
  case PAGE_MENU: {
    switch (action.type) {
    case SHOW_HOST: {
      return {
        ...state,
        page: PAGE_HOST,
      }
    }
    case SHOW_JOIN: {
      return {
        ...state,
        page: PAGE_JOIN,
      }
    }
    }
    break;
  }

  case PAGE_HOST: {
    switch (action.type) {
    case CANCEL: {
      return {
        ...state,
        page: PAGE_MENU,
      }
    }

    case HOST_GAME: {
      return {
        ...state,
        page: PAGE_LOBBY,
      };
    }
    }
    break;
  }

  case PAGE_JOIN: {
    switch (action.type) {
    case CANCEL: {
      return {
        ...state,
        page: PAGE_MENU,
      }
    }

    case JOIN_GAME: {
      return {
        ...state,
        page: PAGE_LOBBY,
      };
    }
    }
    break;
  }

  case PAGE_LOBBY: {
    switch (action.type) {
    case CANCEL: {
      return {
        ...state,
        page: PAGE_MENU,
      }
    }

    case START_GAME: {
      return {
        ...state,
        page: PAGE_REVEAL,
      }
    }
    }
    break;
  }

  case PAGE_REVEAL: {
    switch (action.type) {
    case REVEAL_READY: {
      return {
        ...state,
        page: PAGE_DAY,
      }
    }
    }
    break;
  }

  case PAGE_NIGHT: {
    switch (action.type) {
    case CHOOSE_VICTIM: {
      return {
        ...state,
        page: PAGE_NIGHT,
      }
    }
    }
    break;
  }


  case PAGE_DAY: {
    switch (action.type) {
    case NOMINATE: {
      return {
        ...state,
        page: PAGE_VOTE,
      }
    }
    }
    break;
  }

  case PAGE_VOTE: {
    switch (action.type) {
    case VOTE_YES: {
      return {
        ...state,
        page: PAGE_NIGHT,
      }
    }

    case VOTE_NO: {
      return {
        ...state,
        page: PAGE_END,
      }
    }
    }
    break;
  }

  }

  return state;
}

export function showHost() {
  return {
    type: SHOW_HOST,
  };
}

export function showJoin() {
  return {
    type: SHOW_JOIN,
  };
}

export function joinGame(playerName, gameCode) {
  return {
    type: JOIN_GAME,
    gameCode,
    playerName,
  };
}

export function hostGame(playerName) {
  return {
    type: HOST_GAME,
    playerName,
  };
}

export function cancel(playerName) {
  return {
    type: CANCEL,
  };
}

export function startGame() {
  return {
    type: START_GAME,
  };
}

export function revealReady() {
  return {
    type: REVEAL_READY,
  };
}

export function chooseVictim(ownPlayerId, victimPlayerId) {
  return {
    type: CHOOSE_VICTIM,
    ownPlayerId,
    victimPlayerId,
  };
}

export function nominate(ownPlayerId, victimPlayerId) {
  console.log('NOM');
  return {
    type: NOMINATE,
    ownPlayerId,
    victimPlayerId,
  };
}

export function voteYes() {
  return {
    type: VOTE_YES,
  };
}

export function voteNo() {
  return {
    type: VOTE_NO,
  };
}
