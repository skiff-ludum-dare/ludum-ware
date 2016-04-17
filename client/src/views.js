import React from 'react';
import Hammer from 'hammerjs';

const MIN_PLAYERS = 5;

function supportsMultiTouch() {
  return window.navigator.maxTouchPoints > 1
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

    isOwner: React.PropTypes.bool,

    onStart: React.PropTypes.func,
    onCancel: React.PropTypes.func,
  },

  render () {
    const { gameCode, players, onStart, onCancel, isOwner } = this.props;
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
          <small>{players.length < MIN_PLAYERS && (
            `Minimum of ${MIN_PLAYERS} players required.`
          )}
          &nbsp;</small>
        </div>

        <div className="roster">
          <ol className="roster-list">
            { players.map(({id, name}) => (
              <li className="highlight" key={id}>{ name }</li>
            )) }
            { (new Array(MIN_PLAYERS - players.length)).fill(null).map(() => (
              <li>&lt;waiting&gt;</li>
            )) }
          </ol>
        </div>

        <div className="actions">
          <hr className="hidden-xs" />
          { isOwner && (
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
    const normal = <p>&lt;hidden&gt;</p>;
    const secret = <p className={role}>{role.toUpperCase()}</p>;
    const instruction = supportsMultiTouch() ? 'two-finger press' : 'click and hold';
    return (
      <div className="phase phase-reveal" ref="reveal">
        <div className="info">
          <h2 className="offset">Who are you really...?</h2>
          <h2><small>&#91;{instruction}&#93;</small></h2>
        </div>

        <div className="character highlight">
          { show ? secret : normal }
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
        <h2>{ type }</h2>
        <ul>
          { players.map(({name, alive, id}) => (
            <li
               key={id}
               onClick={() => onSelect(id)}

               onMouseDown={() => onSelect(id)}
               onMouseUp={() => onUnselect(id)}
               onTouchStart={() => onSelect(id)}
               onTouchEnd={() => onUnselect(id)}
               onTouchCancel={() => onUnselect(id)}
              >{ name }</li>
          )) }
        </ul>
      </div>
    );
  }
});

export const Vote = React.createClass({
  displayName: 'Vote',

  propTypes: {
    nominatedUser: React.PropTypes.object,
    accuserUser: React.PropTypes.object,
    onVoteYes: React.PropTypes.func,
    onVoteNo: React.PropTypes.func,
  },

  render () {
    const { nominatedUser, accuserUser, onVoteYes, onVoteNo } = this.props;
    return (
      <div className="phase phase-vote">
        <h2>{ accuserUser.name } wants to lynch { nominatedUser.name }</h2>
        <button onClick={onVoteYes}>Yes, hang them high</button>
        <button onClick={onVoteNo}>No, let them go</button>
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
        <h2>{ winningTeam } wins</h2>
        <button onClick={onFinish}>Done</button>
      </div>
    );
  }
});
