'use strict';
import React from 'react';
import Howler from 'react-howler';

export const Sound = React.createClass({

  componentDidMount() {
    // this.refs.engine.volume(.2);
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
