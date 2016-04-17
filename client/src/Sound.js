'use strict';
import React from 'react';
import Howler from 'react-howler';

import {ENGINE_VOL, INTRO_VOL} from './config'

export const Sound = React.createClass({

  componentDidMount() {
    this.setVolume.call(this, 'engine', ENGINE_VOL);
  },

  setVolume(ref, vol) {
    this.refs[ref]._howler._volume = vol;
  },

  render() {
    return (
      <div id="sounds">
        <Howler
          src='sound/engine.wav'
          playing={true}
          loop={true}
          ref="engine"
        />
      </div>
    );
  }

});

export const IntroSound = React.createClass({

  componentDidMount() {
    this.setVolume.call(this, 'intro', INTRO_VOL);
  },

  setVolume(ref, vol) {
    this.refs[ref]._howler._volume = vol;
  },

  render() {
    return (
      <Howler
        src='sound/intro.wav'
        playing={true}
        loop={true}
        ref="intro"
      />
    );
  }

});
