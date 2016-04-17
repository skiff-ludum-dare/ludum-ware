'use strict';
import React from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'underscore';
import * as views from './views';
import {Sound} from './Sound';
import {Starfield} from './Starfield';
import {
  PAGE_MENU, PAGE_HOST, PAGE_JOIN, PAGE_LOBBY,
  PAGE_REVEAL, PAGE_NIGHT, PAGE_DAY, PAGE_VOTE, PAGE_END
} from './constants';
import {
  showHost, showJoin, joinGame, hostGame, cancel,
  startGame, revealReady, chooseVictim, nominate, voteYes, voteNo
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
  dispatch => bindActionCreators({onStart: startGame, onCancel: cancel}, dispatch),
)(views.Lobby);

const Reveal = connect(
  state => ({
    role: 'villager'
    //role: _.findWhere(state.game.players, {id: state.userId}).role,
  }),
  dispatch => bindActionCreators({ onReady: revealReady }, dispatch),
)(views.Reveal);

const Day = connect(
  state => ({
    type: 'day',
    players: state.game.players,
    ownPlayerId: state.userId,
  }),
  dispatch => bindActionCreators({ onSelect: nominate, onUnselect: () => {} }, dispatch),
)(views.GameRound);

const Night = connect(
  state => ({
    type: 'night',
    players: state.game.players,
    ownPlayerId: state.userId,
  }),
  dispatch => bindActionCreators({ onSelect: chooseVictim, onUnselect: () => {} }, dispatch),
)(views.GameRound);

const Vote = connect(
  state => ({
    nominatedUser: _.findWhere(state.game.players, {id: state.game.nomination.nominatedUserId}),
    accuserUser: _.findWhere(state.game.players, {id: state.game.nomination.accuserUserId}),
  }),
  dispatch => bindActionCreators({ onVoteYes: voteYes, onVoteNo: voteNo }, dispatch),
)(views.Vote);

const GameEnd = connect(
  state => ({
    winningTeam: 'villagers',
  }),
  dispatch => bindActionCreators({onFinish: cancel}, dispatch),
)(views.GameEnd);

const pages = {
  [PAGE_MENU]: Menu,
  [PAGE_HOST]: Host,
  [PAGE_JOIN]: Join,
  [PAGE_LOBBY]: Lobby,
  [PAGE_REVEAL]: Reveal,
  [PAGE_DAY]: Day,
  [PAGE_NIGHT]: Night,
  [PAGE_VOTE]: Vote,
  [PAGE_END]: GameEnd,
};

const App = React.createClass({
  displayName: 'App',

  propTypes: {
  },

  render () {
    const { page, waiting } = this.props;
    console.log(page);
    const Page = pages[page];

    return <article>
      <Sound/>
      <Starfield/>
      <main id="page">
        <Page waiting={waiting}/>
      </main>
    </article>;
  }
});


export default connect(state => state)(App);
