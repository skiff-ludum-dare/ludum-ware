'use strict';
import uuid from 'uuid';
import io from 'socket.io-client';
import {
  PAGE_MENU, PAGE_HOST, PAGE_JOIN, PAGE_LOBBY, PAGE_REVEAL, PAGE_NIGHT, PAGE_VOTE, PAGE_DAY, PAGE_END,
  CREATE_GAME, START_GAME, JOIN_GAME, REVEAL_READY, NOMINATE, VOTE_YES, VOTE_NO, DEVOUR, UPDATE_STATE,
  ERROR,
  SHOW_HOST, SHOW_JOIN,
  GAME_STATE_UPDATE, CONNECTING, CONNECTED, HOST_GAME, CANCEL, CHOOSE_VICTIM,
} from './constants';

const API_CREATE_GAME = `http://${window.location.hostname}:8080/game`;
const SOCKET_IO_ENDPOINT = `http://${window.location.hostname}:8080`;

const initialState = {
  page: PAGE_MENU,
  userId: uuid.v4(),
  loading: false,
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

  case PAGE_HOST:
  case PAGE_JOIN: {
    switch (action.type) {
    case CANCEL: {
      return {
        ...state,
        page: PAGE_MENU,
      }
    }

    case HOST_GAME: {
      let { userId, playerName } = action;
      return {
        ...state,
        loading: true,
        userId,
        playerName,
      };
    }

    case JOIN_GAME: {
      let { gameCode, userId, playerName } = action;
      return {
        ...state,
        loading: false,
        userId,
        playerName,
        gameCode,
      };
    }


    case CONNECTED: {
      return {
        ...state,
        loading: false,
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

export function gameStateUpdate(data) {
  console.log('GAME UPDATE', data);
  return {
    type: GAME_STATE_UPDATE,
    game: JSON.parse(data),
  }
}

export function joinGame(playerName, gameCode) {
  return (dispatch, getState) => {
    let {userId} = getState();
    dispatch({
      type: JOIN_GAME,
      userId,
      gameCode,
      playerName,
    });

    const socket = io(SOCKET_IO_ENDPOINT);
    dispatch({
      type: CONNECTING,
      socket,
    });
    let connected = false;
    socket.on('connect', () => {
      socket.send(JSON.stringify({type: JOIN_GAME, playerName, gameCode, userId}));
    });
    socket.on('message', data => {
      dispatch(gameStateUpdate(data));

      if (!connected) {
        connected = true;
        dispatch({
          type: CONNECTED,
          socket,
        });
        console.log('CONNECT');
      }
    });
  };
}


export function hostGame(playerName) {
  const userId = uuid.v4();
  return dispatch => {
    dispatch({
      type: HOST_GAME,
      playerName,
      userId,
    });

    fetch(API_CREATE_GAME, {
        method: 'POST',
        body: JSON.stringify({userId}),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      })
      .then(r => r.json())
      .then(
        (data) => {
          // dispatch(gameStateUpdate(data));
          dispatch(joinGame(playerName, data.gameCode));
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
