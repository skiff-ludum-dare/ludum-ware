'use strict';
import uuid from 'uuid';
import {
  PAGE_MENU, PAGE_HOST, PAGE_JOIN, PAGE_LOBBY, PAGE_REVEAL, PAGE_NIGHT, PAGE_VOTE, PAGE_DAY, PAGE_END,
  CREATE_GAME, START_GAME, JOIN_GAME, REVEAL_READY, NOMINATE, VOTE_YES, VOTE_NO, DEVOUR, UPDATE_STATE,
  PHASE_LOBBY, PHASE_REVEAL,
  ERROR,
  SHOW_HOST, SHOW_JOIN,
  GAME_STATE_UPDATE, CONNECTING, CONNECTED, HOST_GAME, CANCEL, CHOOSE_VICTIM,
} from './constants';


const initialState = {
  page: PAGE_MENU,
  userId: uuid.v4(),
  loading: false,
  game: {
    gameCode: null,
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

const pmap = {
  [PHASE_LOBBY]: PAGE_LOBBY,
  [PHASE_REVEAL]: PAGE_REVEAL,
};

function menuReducer(state, action) {
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
  return state;
}

// Host/join
function startGameReducer(state, action) {
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
  }
  return state;
}

function lobbyReducer(state, action) {
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
  return state;
}

function revealReducer(state, action) {
  switch (action.type) {
  case REVEAL_READY: {
    return {
        ...state,
      page: PAGE_DAY,
    }
  }
  }
  return state;
}

function nightReducer(state, action) {
  switch (action.type) {
  case CHOOSE_VICTIM: {
    return {
        ...state,
      page: PAGE_NIGHT,
    }
  }
  }
  return state;
}

function dayReducer(state, action) {
  switch (action.type) {
  case NOMINATE: {
    return {
        ...state,
      page: PAGE_VOTE,
    }
  }
  }
  return state;
}

function voteReducer(state, action) {
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
  return state;
}

export default function reducer(state=initialState, action) {

  if (action.type === GAME_STATE_UPDATE) {

    //hack
    const meh ={};
    if (action.game.phase !== state.game.phase && pmap[action.game.phase]) {
      meh.page = pmap[action.game.phase];
    }

    return {
      ...state,
      ...meh,
      game: action.game,
    };
  }

  switch (state.page) {
  case PAGE_MENU:
    return menuReducer(state, action);

  case PAGE_HOST:
  case PAGE_JOIN:
    return startGameReducer(state, action);

  case PAGE_LOBBY:
    return lobbyReducer(state, action);

  case PAGE_REVEAL:
    return revealReducer(state, action);

  case PAGE_NIGHT:
    return nightReducer(state, action);

  case PAGE_DAY:
    return dayReducer(state, action);

  case PAGE_VOTE:
    return voteReducer(state, action);
  }

  return state;
}
