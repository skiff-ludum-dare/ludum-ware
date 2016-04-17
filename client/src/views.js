import React from 'react';
import Hammer from 'hammerjs';

import {IntroSound} from './Sound';

function supportsMultiTouch() {
  return window.navigator.maxTouchPoints > 1;
}

export const Menu = React.createClass({
  displayName: 'Menu',

  propTypes: {
    onJoin: React.PropTypes.func,
    onHost: React.PropTypes.func,
  },

  render () {
    const {onJoin, onHost} = this.props;
    return (
      <div className="phase phase-menu">
        <IntroSound/>
        <aside className="spaceship"></aside>
        <div className="actions">
          <h1>Terrormorph!</h1>
          <button
            className="primary"
            onClick={onHost}
          >Host</button>
          <button onClick={onJoin}>Join</button>
        </div>
        <div className="copyright">
          <hr className="hidden-xs" />
          <small>&copy; 2016 Classique TM</small>
        </div>
      </div>
    );
  }
});

export const StartGame = React.createClass({
  displayName: 'StartGame',

  propTypes: {
    type: React.PropTypes.oneOf(['host', 'join']),
    onNext: React.PropTypes.func,
    onCancel: React.PropTypes.func,
  },

  getInitialState () {
    return {
      gameCode: '',
      name: '',
    };
  },

  handleSubmit(e) {
    e.preventDefault();
  },

  render () {
    const { type, onNext, onCancel } = this.props;
    const { name, gameCode } = this.state;
    return (
      <div className="phase phase-start">
        <h2 className="offset">Welcome aboard the SS-LUDUM!</h2>
        <form onSubmit={this.handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter name"
              value={name}
              onChange={e => this.setState({name: e.target.value})}
              required
            />
          </div>
          { type === 'join' && (
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter code"
                value={gameCode}
                onChange={e => this.setState({gameCode: e.target.value})}
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="primary"
            onClick={() => onNext(name, gameCode)}
          >Go</button>
          <button
            type="reset"
            onClick={onCancel}
          >Exit</button>
        </form>
      </div>
    );
  }
});

export const Lobby = React.createClass({
  displayName: 'Lobby',

  propTypes: {
    gameCode: React.PropTypes.string,
    players: React.PropTypes.arrayOf(React.PropTypes.object),
    ownPlayerId: React.PropTypes.string,
    canStart: React.PropTypes.bool,
    minPlayers: React.PropTypes.number,

    onStart: React.PropTypes.func,
    onCancel: React.PropTypes.func,
  },

  render () {
    const { gameCode, minPlayers, players, onStart, onCancel, canStart, ownPlayerId } = this.props;
    return (
      <div className="phase phase-lobby">
        <div className="info">
          <form noValidate>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                defaultValue={gameCode}
                readOnly
              />
            </div>
          </form>
          <h2>Flight roster:</h2>
          <small>{players.length < minPlayers && (
            `Minimum of ${minPlayers} players required.`
          )}
          &nbsp;</small>
        </div>

        <div className="roster">
          <ol className="roster-list">
            { players.map(({id, name}) => (
              <li
                className={ id === ownPlayerId ? 'highlight' : '' }
                key={id}
              >{ name }</li>
            )) }
            { (new Array(minPlayers - players.length)).fill(null).map((v, i) => (
              <li key={i}>&lt;waiting&gt;</li>
            )) }
          </ol>
        </div>

        <div className="actions">
          <hr className="hidden-xs" />
          { canStart && (
              <button
                className="primary"
                onClick={onStart}
              >Ready</button>
            )
          }
          <button onClick={onCancel}>Exit</button>
        </div>
      </div>
    );
  }
});

export const Reveal = React.createClass({
  displayName: 'Reveal',

  propTypes: {
    role: React.PropTypes.oneOf(["villager", "wolf"]),
    onReady: React.PropTypes.func,
  },

  getInitialState () {
    return {
      show: false,
      hasShown: false,
    };
  },

  componentDidMount() {
    const revealing = new Hammer.Manager(this.refs.reveal);
    const numPointers = supportsMultiTouch() ? 2 : 1;

    revealing.add( new Hammer.Press({ event: 'revealhold', pointers: numPointers }) );
    revealing.on('revealhold', () => {
      revealing.on('revealholdup', () => {
        revealing.off('revealholdup');
        this.hide();
      });
      this.show();
    });
  },

  show () {
    this.setState({show: true, hasShown: true});
  },

  hide () {
    this.setState({show: false});
  },

  render () {
    const { role, onReady } = this.props;
    const { show, hasShown } = this.state;
    const instruction = supportsMultiTouch() ? 'two-finger press' : 'click and hold';
    return (
      <div className="phase phase-reveal" ref="reveal">
        <div className="info">
          <h2 className="offset">Who are you really...?</h2>
          <h2><small>&#91;{instruction}&#93;</small></h2>
        </div>

        <div className="character">
          <img
            className="center-block img-responsive"
            src="images/astronaut.png"
            alt="Astronaut"
          />
          <img
            className={`center-block img-responsive img-reveal img-reveal-${show ? 'opaque' : 'transparent'}`}
            src={`images/astronaut_${role === 'wolf' ? 'terror' : 'human'}.png`}
            alt="Astronaut Revealed"
          />
        </div>

        <div className="actions">
          { hasShown && (
            <button
              type="button"
              className="primary"
              onClick={onReady}
            >Ready</button>
            )
          }
        </div>
      </div>
    );
  }
});

export const GameRound = React.createClass({
  displayName: 'GameRound',

  propTypes: {
    type: React.PropTypes.oneOf(["day", "night"]),
    players: React.PropTypes.arrayOf(React.PropTypes.object),
    ownPlayerId: React.PropTypes.string,
    onSelect: React.PropTypes.func,
    onUnselect: React.PropTypes.func,
  },

  render () {
    const { type, players, ownPlayerId, onSelect, onUnselect } = this.props;
    return (
      <div className="phase phase-round">
        <div className="info">
          <h2 className="offset">{ type }</h2>
        </div>

        <div className="survivors">
          <ul>
            { players.map(({name, alive, id}) => (
              <li
                 key={id}
                 className={ id === ownPlayerId ? 'highlight' : '' }
                 onMouseDown={() => onSelect(id)}
                 onMouseUp={() => onUnselect(id)}
                 onTouchStart={() => onSelect(id)}
                 onTouchEnd={() => onUnselect(id)}
                 onTouchCancel={() => onUnselect(id)}
                >{ name }</li>
            )) }
          </ul>
        </div>
      </div>
    );
  }
});

export const GameEnd = React.createClass({
  displayName: 'GameEnd',

  propTypes: {
    winningTeam: React.PropTypes.oneOf(["villagers", "wolves"]),
    onFinish: React.PropTypes.func,
  },

  render () {
    const { winningTeam, onFinish } = this.props;
    return (
      <div className="phase phase-end">
        <div className="info">
          <h2 className="offset">{ winningTeam } wins</h2>
        </div>
        <div className="actions">
          <button onClick={onFinish}>Done</button>
        </div>
      </div>
    );
  }
});
