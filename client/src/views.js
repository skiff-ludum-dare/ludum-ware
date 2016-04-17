import React from 'react';
import Hammer from 'hammerjs';
import classNames from 'classnames';
import Credits from './Credits';
import Fireworks from './Fireworks';
import Icon from 'react-fa';

import {GLOBAL_ANIMATION_SPEED} from './config';
import {WEREWOLF, VILLAGER, PHASE_DAY, PHASE_NIGHT} from './constants';

import {IntroSound} from './Sound';

function supportsMultiTouch() {
  return window.navigator.maxTouchPoints > 1;
}

export const Menu = React.createClass({
  displayName: 'Menu',

  getInitialState() {
    return {
      astronautSrc: 'images/ejected.png',
      showCredits: false,
      astronautAlt: 'Ejected Astronaut'
    };
  },

  propTypes: {
    onJoin: React.PropTypes.func,
    onHost: React.PropTypes.func,
  },

  componentDidMount() {
    window.setTimeout(() => {
      const {astronautSrc, astronautAlt} = this.state;

      this.setState({
        astronautSrc: astronautSrc.replace('ejected', 'ejected_splatter'),
        astronautAlt: astronautAlt.replace('Ejected', 'Splattered')
      });
    }, GLOBAL_ANIMATION_SPEED * .5)
  },

  render () {
    const {onJoin, onHost} = this.props;
    const {astronautSrc, astronautAlt} = this.state;
    const toggleCredits = () => {
      this.setState({showCredits: !this.state.showCredits});
    };

    return (
      <div className="phase phase-menu">
        { this.state.showCredits ? <Credits onClose={ toggleCredits } /> : null }
        <IntroSound/>
        <aside className="spaceship">
          <img className="center-block img-responsive" src="images/station.png" alt="Space Station" />
          <img className="center-block img-responsive slide-in-right animated" src="images/ship.png" alt="Space Ship" />
          <img className="center-block img-responsive slide-out-left animated" src={astronautSrc} alt={astronautAlt} />
        </aside>
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
          <small className="button" onClick={ toggleCredits }>Credits</small>
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
              maxLength={25}
              required
            />
          </div>
          { type === 'join' && (
            <div className="form-group">
              <input
                type="text"
                className="form-control game-code-input"
                placeholder="Enter code"
                value={gameCode}
                onChange={e => this.setState({gameCode: e.target.value})}
                maxLength={4}
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="primary"
            onClick={() => onNext(name, gameCode)}
          >Go</button>
        </form>
        <button
          onClick={onCancel}
        >Exit</button>
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
    onKick: React.PropTypes.func,
    canKick: React.PropTypes.bool.isRequired,
  },

  render () {
    const { gameCode, minPlayers, players, onStart,
      onCancel, canKick, onKick, canStart, ownPlayerId } = this.props;
    return (
      <div className="phase phase-lobby">
        <div className="info">
          <form noValidate>
            <div className="form-group">
              <label className="form-control-label">
                <small>Game Code:</small>
              </label>
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
              >
                { name }
                {(canKick && ownPlayerId !== id) ? <span> (<a onClick={() => onKick(id)}>kick</a>)</span> : null}

              </li>
            )) }
            { (new Array(Math.max(0, minPlayers - players.length))).fill(null).map((v, i) => (
              <li key={i}>&lt;waiting&gt;</li>
            )) }
          </ol>
        </div>

        <div className="actions">
          <hr className="hidden-xs" />
          { canStart ? (
              <button
                className="primary"
                onClick={onStart}
              >Ready</button>
            ) : <div>Waiting for owner</div>
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
    role: React.PropTypes.oneOf([WEREWOLF, VILLAGER]).isRequired,
    onReady: React.PropTypes.func.isRequired,
  },

  getInitialState() {
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
    const { role, onReady, index } = this.props;
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
            src={`images/astronaut_${role === WEREWOLF ? 'terror' : 'human' + (index % 4)}.png`}
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

export const Dead = React.createClass({
  displayName: 'Dead',

  render () {
    return (
      <div className="phase phase-dead">
        <div className="info">
          <h2 className="offset">
            <small>&#8220;Where did your head go?&#8221;</small><br />
            <span>You are DEAD!</span>
          </h2>
        </div>

        <div className="character">
          <img
            className="center-block img-responsive"
            src="images/astronaut_eaten.png"
            alt="Dead Astronaut"
          />
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

    votesNeeded: React.PropTypes.number,
    victimUserId: React.PropTypes.string,

    onSelect: React.PropTypes.func,
    onUnselect: React.PropTypes.func,
  },

  render () {
    const { type, players, ownPlayerId, votesNeeded, victimUserId, onSelect, onUnselect } = this.props;

    return (
      <div className="phase phase-round">
        <div className="info">
          <h2 className="offset">{ type.toUpperCase() }</h2>
          <small>
            {(type === "day") && <span>You must select a crew mate to kill, as a group<br /></span>}
            {(type === "night") && <span className="highlight">All must select a crew mate, but only the Terrormorph will kill<br /></span>}
            {(type === "day") && <span className="highlight">{votesNeeded} votes for majority<br /></span>}
            <span>&#91;{`${supportsMultiTouch() ? 'press' : 'click'} and hold to vote`}&#93;</span>
          </small>
        </div>

        <div className="survivors">
          <ul className="survivors-list">
            { players.map(({name, alive, killVotes, id}) => {
              let cssClasses = classNames({ 'highlight': id === ownPlayerId, 'accused': id === victimUserId })
              return(
                alive ?
                <li
                  key={id}
                  className={cssClasses}
                  onMouseDown={() => onSelect(id)}
                  onMouseUp={() => onUnselect(id)}
                  onTouchStart={() => onSelect(id)}
                  onTouchEnd={() => onUnselect(id)}
                  onTouchCancel={() => onUnselect(id)}
                >
                  <span>{ name }</span>
                  { (killVotes > 0 && type === "day") && <span className="danger votes">{killVotes}</span> }
                </li>
                :
                <li className="danger dead" key={id}>{ name }</li>);
            }) }
          </ul>
        </div>
      </div>
    );
  }
});

export const Narrative = React.createClass({
  displayName: 'Narrative',

  propTypes: {
    survivingPlayers: React.PropTypes.number,
    deadPlayers: React.PropTypes.number,
    lastVictim: React.PropTypes.object,
    round: React.PropTypes.number,
    seed: React.PropTypes.number,
    phase: React.PropTypes.string,

    onReady: React.PropTypes.func,
  },

  render () {
    const { onReady, survivingPlayers, deadPlayers, lastVictim, round, seed, phase } = this.props;
    let content;

    if (round === 1 && phase === PHASE_DAY) {
      content = (
        <div>
          <h3 className="offset">Earth Day {100 + round}:</h3>
          <h2>The crew has been asleep for 100 earth days.</h2>
          <h4>&#8220;BEEEEEP BEEEEEP&#8221;</h4>
          <h5>The warning rings throughout the ship, as the fluid is drained from around the sleeping bodies, and they are jolted suddenly awake.</h5>
          <h4>&#8220;Non-human lifeform detected&#8221;</h4>
          <h5>The blurry-eyed space sailors assemble in the Galley...</h5>
        </div>
      );
    } else if (phase === PHASE_DAY) {
      content = (
        <div>
          <h3 className="offset">Earth Day {100 + round}:</h3>
          <h2>The crew awake to discover {lastVictim.name} torn to pieces</h2>
          <h5>The Terrormorph still walks among you, you must expel it immediately!</h5>
        </div>
      );
    } else {
      content = (
        <div>
          <h3 className="offset">Earth Day {100 + round}:</h3>
          <h2>{lastVictim.name} has become a space firework.</h2>
          <h5>But danger still lurks... in the night, another crew member will fall prey to the Terrormorph.</h5>
        </div>
      );
    }

    return (
      <div className="phase phase-narrative">
        <div className="info">
          { content }
        </div>
        <div className="actions">
          <button
            type="button"
            className="primary"
            onClick={onReady}
          >Ready</button>
        </div>
      </div>
    );
  }
});

export const GameEnd = React.createClass({
  displayName: 'GameEnd',

  propTypes: {
    winningTeam: React.PropTypes.oneOf([WEREWOLF, VILLAGER]).isRequired,
    isWinner: React.PropTypes.bool.isRequired,
    onFinish: React.PropTypes.func.isRequired,
  },

  render () {
    const { winningTeam, isWinner, onFinish } = this.props;

    return (
      <div className={ classNames('phase phase-end', { 'winner': isWinner }) }>
        { isWinner ? <Fireworks /> : null }
        { winningTeam === VILLAGER
        ?
         <div className="character">
           <img
             className="center-block img-responsive"
             src="images/station.png"
           />
         </div>
        :
         <div className="character">
           <img
             className="center-block img-responsive"
             src="images/station_ruined.png"
           />
         </div>
       }

        <div className="info">
          { winningTeam === VILLAGER
          ?
          <h2 className="offset">The crew of the SS-LUDUM has survivied.</h2>
          :
          <h2 className="offset">Non-human life forms are now the only life form.</h2>
          }
          <h3>{ isWinner ? "You've won. Celebrate." : winningTeam + " won. You become the devoured."}</h3>
        </div>
        <div className="actions">
          <button onClick={onFinish}>
            <Icon name="repeat" />
            <span>Replay</span>
          </button>
        </div>
      </div>
    );
  }
});
