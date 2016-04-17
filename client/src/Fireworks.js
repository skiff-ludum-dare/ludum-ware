import React from 'react';
import _ from 'underscore';
import './fireworks.css';

export default () => {
  return (
  <div className="wrap">
    { _.map(_.range(10), () => {
      return (<div className="firework">
        { _.map( _.range(40), () => <div className="c"></div>) }
      </div>)
      })
    }
  </div>
  );
};
