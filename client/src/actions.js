import uuid from 'uuid';
import io from 'socket.io-client';
import _ from 'underscore';

import {
  PAGE_MENU, PAGE_HOST, PAGE_JOIN, PAGE_LOBBY, PAGE_REVEAL, PAGE_NIGHT, PAGE_VOTE, PAGE_DAY, PAGE_END,
  CREATE_GAME, START_GAME, JOIN_GAME, REVEAL_READY, NOMINATE, VOTE_YES, VOTE_NO, DEVOUR, UPDATE_STATE,
  PHASE_LOBBY, PHASE_REVEAL,
  ERROR,
  SHOW_HOST, SHOW_JOIN,
  GAME_STATE_UPDATE, CONNECTING, CONNECTED, HOST_GAME, CANCEL, CHOOSE_VICTIM,
} from './constants';

import * as api from './api';

api.serverEvents.on('gameState', gameStateUpdate);

function message(type, message={}) {
  return (dispatch, getState) => {
    let {userId, game} = getState();
    if (game) {
      dispatch({...message, type});
      api.sendMessage(userId, game.gameCode, type, message);
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
    game: JSON.parse(data),
  }
}

export function joinGame(playerName, gameCode) {
  return (dispatch, getState) => {
    let {userId} = getState();
    dispatch({type: JOIN_GAME, status: 'request'});
    api.joinGame(userId, playerName, gameCode)
      .then(
        gameState => {
          gameStateUpdate(gameState);
          dispatch({type: JOIN_GAME, status: 'response'});
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
      userId,
      status: 'request',
    });

    api.hostGame(userId, playerName)
      .then(
        gameState => {
          gameStateUpdate(gameState);
          dispatch({type: HOST_GAME, playerName, userId, status: 'response'});
        },
        error => {
          dispatch({type: ERROR, originalType: HOST_NAME, error});
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
  return (dispatch, getState) => {
    dispatch(message(START_GAME));
    // dispatch({ type: START_GAME, });
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
