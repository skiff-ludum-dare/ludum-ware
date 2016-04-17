import io from 'socket.io-client';
import _ from 'underscore';

import {
  PAGE_MENU, PAGE_HOST, PAGE_JOIN, PAGE_GAME,
  CREATE_GAME, START_GAME, JOIN_GAME, READY, SELECT_VICTIM, UNSELECT_VICTIM, UPDATE_STATE,
  PHASE_LOBBY, PHASE_REVEAL,
  ERROR,
  SHOW_HOST, SHOW_JOIN, KICK,
  GAME_STATE_UPDATE, CONNECTING, CONNECTED, HOST_GAME, CANCEL, CHOOSE_VICTIM, DISCONNECT
} from './constants';

import * as api from './api';


function message(type, message={}) {
  return (dispatch, getState) => {
    let {userId, playerName, game} = getState();
    if (game) {
      dispatch({...message, type});
      api.sendMessage(userId, game.gameCode, playerName, type, message);
    } else {
      console.error("Tried to send a message without a game", type, message);
    }
  };
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
  if (data.error) {
    console.error("SIMON ERROR, PLEASE REPLACE YOUR SIMON:", data.error)
  }
  return {
    type: GAME_STATE_UPDATE,
    game: data,
  }
}

export function joinGame(playerName, gameCode) {
  if (!playerName || !gameCode) return;
  return (dispatch, getState) => {
    let {userId} = getState();
    dispatch({type: JOIN_GAME, playerName});
    api.joinGame(userId, playerName, gameCode)
      .then(
        gameState => {
          gameStateUpdate(gameState);
          dispatch({type: JOIN_GAME, playerName, complete: true})
        },
        error => {
          dispatch({type: ERROR, originalType: JOIN_GAME, error});
        }
      );
  };
}


export function hostGame(playerName) {
  if (!playerName) return;
  return (dispatch, getState) => {
    let {userId} = getState();
    dispatch({
      type: HOST_GAME,
      playerName,
    });

    api.hostGame(userId, playerName)
      .then(
        gameState => {
          gameStateUpdate(gameState);
          dispatch({type: HOST_GAME, playerName, complete: true});
        },
        error => {
          dispatch({type: ERROR, originalType: HOST_GAME, error});
        }
      )
  }
}

export function cancel() {
  return {type: CANCEL};
}

export function disconnect() {
  return (dispatch, setState) => {
    api.disconnect();
    dispatch({type: DISCONNECT});
  };
}

export function startGame() {
  return message(START_GAME);
}

export function ready() {
  return message(READY);
}

export function selectVictim(victimUserId) {
  // console.log('SELECT VICTIM');
  return message(SELECT_VICTIM, {
    victimUserId,
  })
}

export function unselectVictim() {
  // console.log('UNSELECT VICTIM');
  return message(UNSELECT_VICTIM);
}

export function kick(kickUserId) {
  return message(KICK, {kickUserId});
}
