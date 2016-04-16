'use strict';
import uuid from 'uuid';
import WebSocket from 'ws';

const API_CREATE_GAME = 'http://127.0.0.1:8080/game';


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
  playerId: uuid.v4(),
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

const ERROR = "ERROR";

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
  return dispatch => {
    dispatch({
      type: JOIN_GAME,
      gameCode,
      playerName,
    });

  };
}

export function hostGame(playerName) {
  const userId = uuid.v4();
  return dispatch => {
    // dispatch({
    //   type: HOST_GAME,
    //   playerName,
    // });

    console.log('FETCH N SHIT');
    fetch(API_CREATE_GAME, {method: 'POST', body: JSON.stringify({userId})})
      .then(
        (data) => {
          console.log(data);
          dispatch(joinGame(data.gameCode));
        },
        (error) => {
          console.log('e', error);
          dispatch({
            type: ERROR,
            originalType: HOST_GAME,
            error,
          });
        });

  }
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
