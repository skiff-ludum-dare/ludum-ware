import React from 'react';

export const Menu = React.createClass({
  displayName: 'Menu',

  propTypes: {
    onJoin: React.PropTypes.func,
    onHost: React.PropTypes.func,
  },

  render () {
    const {onJoin, onHost} = this.props;
    return (
      <div>
        <h1>Terrormorph</h1>
        <button onClick={onHost}>
         Host
        </button>
        <button onClick={onJoin}>
         Join
        </button>
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

  render () {
    const { type, onNext, onCancel } = this.props;
    const { name, gameCode } = this.state;
    return (
      <div>
        <h1>{ (type === 'host') ? 'Host Game' : 'Join Game' }</h1>
        <input placeholder="Game code" value={gameCode} onChange={e => this.setState({gameCode: e.target.value})}/>
        <input placeholder="Your Name" value={name} onChange={e => this.setState({name: e.target.value})}/>
        <button onClick={() => onNext(name, gameCode)}>
          Go
        </button>
        <button onClick={onCancel}>
         Cancel
        </button>
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
      <div>
        <h1>Lobby</h1>

        <h2>{ gameCode }</h2>

        <ul>
          { players.map(({id, name}) => (
            <li key={id}>{ name }</li>
          )) }
        </ul>

        { isOwner && (
            <button onClick={onStart}>
              Start Game
            </button>
          )
        }
        <button onClick={onCancel}>
         Cancel
        </button>
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

  show () {
    this.setState({show: true, hasShown: true});
  },

  hide () {
    this.setState({show: false});
  },

  render () {
    const { role, onReady } = this.props;
    const { show, hasShown } = this.state;
    const normal = <div>Normal Identity</div>;
    const secret = <div>{role}</div>;
    return (
      <div>
        <div
         onMouseDown={this.show}
         onMouseUp={this.hide}
         onTouchStart={this.show}
         onTouchEnd={this.hide}
         onTouchCancel={this.hide}
          >
          <h1>Reveal</h1>
          { show ? secret : normal }
        </div>
        { hasShown && (
          <button onClick={onReady}>
            Ready
          </button>
          )
        }
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

  select (playerId) {

  },

  unselect () {

  },

  render () {
    const { type, players, ownPlayerId, onSelect, onUnselect } = this.props;
    return (
      <div>
        <h1>{ type }</h1>
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
      <div>
        <h1>{ accuserUser.name } wants to lynch { nominatedUser.name }</h1>
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
      <div>
        <h1>{ winningTeam } wins</h1>
        <button onClick={onFinish}>Done</button>
      </div>
    );
  }
});
