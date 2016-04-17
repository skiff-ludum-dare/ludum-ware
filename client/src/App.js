'use strict';
import React from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'underscore';
import * as views from './views';
import {Sound} from './Sound';
import {Starfield} from './Starfield';
import {Waiter} from './Waiter';
import {
  PAGE_MENU, PAGE_HOST, PAGE_JOIN, PAGE_GAME,
  PHASE_LOBBY, PHASE_REVEAL, PHASE_DAY, PHASE_NIGHT, PHASE_END,
  VILLAGER, WEREWOLF,
} from './constants';
import {
  showHost, showJoin, joinGame, hostGame, cancel,
  startGame, ready, selectVictim, unselectVictim, disconnect
} from './actions';
import {MIN_PLAYERS} from './config';

const Menu = connect(
  state => ({}),
  dispatch => bindActionCreators({ onHost: showHost, onJoin: showJoin }, dispatch),
)(views.Menu);

const Host = connect(
  state => ({type: 'host'}),
  dispatch => bindActionCreators({ onNext: hostGame , onCancel: cancel }, dispatch),
)(views.StartGame);

const Join = connect(
  state => ({type: 'join'}),
  dispatch => bindActionCreators({ onNext: joinGame , onCancel: cancel }, dispatch),
)(views.StartGame);

const Lobby = connect(
  state => {
    const isOwner = _.findWhere(state.game.players, {id: state.userId}).owner;
    const players = state.game.players;
    console.log(players, MIN_PLAYERS);
    return {
      gameCode: state.game.gameCode,
      players,
      ownPlayerId: state.userId,
      canStart: isOwner && players.length >= MIN_PLAYERS,
      minPlayers: MIN_PLAYERS,
    };
  },
  dispatch => bindActionCreators({onStart: startGame, onCancel: disconnect}, dispatch),
)(views.Lobby);

const Reveal = connect(
  state => ({
    role: _.findWhere(state.game.players, {id: state.userId}).role,
    index: _.findIndex(_.where(state.game.players, {role: VILLAGER}), {id: state.userId}),
  }),
  dispatch => bindActionCreators({ onReady: ready }, dispatch),
)(views.Reveal);

const GameRound = connect(
  state => {
    return {
      type: (state.game.phase === PHASE_DAY) ? 'day' : 'night',
      votesNeeded: state.game.votesNeeded,
      players: state.game.players.map(p => {
        const votes = _.filter(state.game.players, otherPlayer => otherPlayer.victimUserId === p.id).length;
        return {
          ...p,
          killVotes: votes,
        }
      }),
      ownPlayerId: state.userId,
      victimUserId: _.findWhere(state.game.players, {id: state.userId}).victimUserId,
    };
  },
  dispatch => bindActionCreators({ onSelect: selectVictim, onUnselect: unselectVictim }, dispatch),
)(views.GameRound);

const GameEnd = connect(
  state => ({
    winningTeam: state.game.winner,
    isWinner: _.find(state.game.players, {id: state.userId}).role === state.game.winner,
  }),
  dispatch => bindActionCreators({onFinish: ready}, dispatch),
)(views.GameEnd);

const Narrative = connect(
  state => ({
    survivingPlayers: _.where(state.game.players, {alive: true}).length,
    deadPlayers: _.where(state.game.players, {alive: false}).length,
    lastVictim: _.findWhere(state.game.players, {id: state.game.lastVictimUserId}),
    round: state.game.round,
    phase: state.game.phase,
    seed: state.game.seed,
  }),
  dispatch => bindActionCreators({ onReady: ready }, dispatch),
)(views.Narrative);

const Dead = views.Dead;

const pages = {
  [PAGE_MENU]: Menu,
  [PAGE_HOST]: Host,
  [PAGE_JOIN]: Join,
};

const phases = {
  [PHASE_LOBBY]: Lobby,
  [PHASE_REVEAL]: Reveal,
  [PHASE_DAY]: GameRound,
  [PHASE_NIGHT]: GameRound,
  [PHASE_END]: GameEnd,
}

const App = React.createClass({
  displayName: 'App',

  propTypes: {
  },

  render () {
    const { page, game, waiting, userId } = this.props;
    let Content;
    if (page === PAGE_GAME && game) {
      const player = _.find(game.players, {id: userId});
      if (game.phase !== PHASE_END && !player.alive) {
        if (game.showNarrative && game.lastVictimUserId === userId) {
          // Show the narrative screen just after you die, build suspense!
          Content = Narrative;
        } else {
          Content = Dead;
        }
      } else if (game.showNarrative) {
        Content = Narrative;
      } else {
        Content = phases[game.phase];
      }
    } else {
      Content = pages[page];
    }

    return <article>
      <Sound/>
      <Starfield/>
      <main id="page">
        <Content waiting={waiting}/>
      </main>
      {waiting && <Waiter/>}
    </article>;
  }
});


export default connect(state => state)(App);
