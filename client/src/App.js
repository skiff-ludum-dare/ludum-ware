'meuse strict';
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
  PHASE_LOBBY, PHASE_REVEAL, PHASE_DAY, PHASE_NIGHT, PHASE_END
} from './constants';
import {
  showHost, showJoin, joinGame, hostGame, cancel,
  startGame, revealReady, selectVictim, unselectVictim
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
    role: _.findWhere(state.game.players, {id: state.userId}).role,
  }),
  dispatch => bindActionCreators({ onReady: revealReady }, dispatch),
)(views.Reveal);

const DayOrNight = connect(
  state => {
    return {
      type: (state.game.phase === PHASE_DAY) ? 'day' : 'night',
      votesNeeded: state.game.votesNeeded,
      players: state.game.players.map(p => {
        const votes = _.where(state.game.players, otherPlayer => otherPlayer.victimUserId === p.id).length;
        return {
          ...p,
          killVotes: votes,
        }
      }),
      ownPlayerId: state.userId,
    };
  },
  dispatch => bindActionCreators({ onSelect: selectVictim, onUnselect: unselectVictim }, dispatch),
)(views.GameRound);

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
};

const phases = {
  [PHASE_LOBBY]: Lobby,
  [PHASE_REVEAL]: Reveal,
  [PHASE_DAY]: DayOrNight,
  [PHASE_NIGHT]: DayOrNight,
  // [PHASE_VOTE]: Vote,
  [PHASE_END]: GameEnd,
}

const App = React.createClass({
  displayName: 'App',

  propTypes: {
  },

  render () {
    const { page, game, waiting } = this.props;
    console.log(page);
    const Page = (page === PAGE_GAME && game) ? phases[game.phase] : pages[page];
    console.log(game && game.phase, page);

    return <article>
      <Sound/>
      <Starfield/>
      <main id="page">
        <Page waiting={waiting}/>
      </main>
      {waiting && <Waiter/>}
    </article>;
  }
});


export default connect(state => state)(App);
