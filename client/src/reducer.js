'use strict';
import uuid from 'uuid';
import {
  PAGE_MENU, PAGE_HOST, PAGE_JOIN, PAGE_GAME,
  CREATE_GAME, START_GAME, JOIN_GAME, REVEAL_READY, SELECT_VICTIM, UNSELECT_VICTIM, UPDATE_STATE,
  PHASE_LOBBY, PHASE_REVEAL, PHASE_DAY, PHASE_NIGHT, PHASE_END,
  ERROR,
  SHOW_HOST, SHOW_JOIN,
  GAME_STATE_UPDATE, CONNECTING, CONNECTED, HOST_GAME, CANCEL,
} from './constants';

// let userId = localStorage.getItem('userId');
// if (!userId) {
//   userId = uuid.v4();
//   localStorage.setItem('userId', userId);
// }
const userId = uuid.v4();

const initialState = {
  page: PAGE_MENU,
  userId,
  loading: false,
  game: null,
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
  case HOST_GAME:
  case JOIN_GAME: {
    let {playerName} = action;
    if (action.complete) {
      return {
          ...state,
        waiting: false,
        playerName,
        page: PAGE_GAME,
      }
    } else {
      return {
          ...state,
        playerName,
        waiting: true,
      };
    }
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
      waiting: true,
    };
  }
  }
  return state;
}

function revealReducer(state, action) {
  switch (action.type) {
  case REVEAL_READY: {
    return {
        ...state,
      waiting: true,
    }
  }
  }
  return state;
}


function dayOrNightReducer(state, action) {
  switch (action.type) {
  case UNSELECT_VICTIM:
    return {
      ...state,
      game: {
        ...state.game,
        players: state.game.players.map(p => (p.id === state.userId) ? {...p, victimUserId: action.victimUserId} : p),
      }
    };

  case SELECT_VICTIM:
    return {
      ...state,
      game: {
        ...state.game,
        players: state.game.players.map(p => (p.id === state.userId) ? {...p, victimUserId: null} : p),
      }
    };
  }
  return state;
}

// function voteReducer(state, action) {
//   switch (action.type) {
//   case VOTE_YES: {
//     return {
//         ...state,
//       page: PAGE_NIGHT,
//     }
//   }

//   case VOTE_NO: {
//     return {
//         ...state,
//       page: PAGE_END,
//     }
//   }
//   }
//   return state;
// }

export default function reducer(state=initialState, action) {

  if (action.type === GAME_STATE_UPDATE) {
    if (!state.game || action.game.phase !== state.game.phase) {
      state = {...state, waiting: false};
    }
    state = {
      ...state,
      game: action.game,
    };
  }

  switch (state.page) {
  case PAGE_MENU:
    return menuReducer(state, action);

  case PAGE_HOST:
  case PAGE_JOIN:
    return startGameReducer(state, action);

  case PAGE_GAME:
    if (state.game) {
      switch (state.game.phase) {
      case PHASE_LOBBY:
        return lobbyReducer(state, action);

      case PHASE_REVEAL:
        return revealReducer(state, action);

      case PHASE_NIGHT:
      case PHASE_DAY:
        return dayOrNightReducer(state, action);
      }
    }

  }

  return state;
}
