import uuid from 'uuid';
import io from 'socket.io-client';
import _ from 'underscore';

import {
  PAGE_MENU, PAGE_HOST, PAGE_JOIN, PAGE_GAME,
  CREATE_GAME, START_GAME, JOIN_GAME, REVEAL_READY, SELECT_VICTIM, UNSELECT_VICTIM, UPDATE_STATE,
  PHASE_LOBBY, PHASE_REVEAL,
  ERROR,
  SHOW_HOST, SHOW_JOIN,
  GAME_STATE_UPDATE, CONNECTING, CONNECTED, HOST_GAME, CANCEL, CHOOSE_VICTIM,
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
  return {
    type: GAME_STATE_UPDATE,
    game: data,
  }
}

export function joinGame(playerName, gameCode) {
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

export function cancel(playerName) {
  return {
    type: CANCEL,
  };
}

export function startGame() {
  return message(START_GAME);
}

export function revealReady() {
  return message(REVEAL_READY);
}

export function selectVictim(victimUserId) {
  return message({
    type: SELECT_VICTIM,
    victimerUserId,
  })
}

export function unselectVictim() {
  return message({
    type: UNSELECT_VICTIM,
  })
}
