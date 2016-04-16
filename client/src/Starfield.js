'use strict';
import React from 'react';

/**!
 *  Dave Kerr c2013, https://github.com/dwmkerr/starfield
 *  Starfield lets you take a div and turn it into a starfield.
 */

// Define the starfield class.
class StarfieldGenerator {

  constructor(div) {
    this.fps = 30;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.minVelocity = 15;
    this.maxVelocity = 30;
    this.stars = 100;
    this.intervalId = 0;

    this.start = this._start.bind(this)
    this.stop = this._stop.bind(this)
    this.update = this._update.bind(this)
    this.draw = this._draw.bind(this)

    // The main function - initialises the starfield.
    // --

    // Store the div.
    this.containerDiv = div;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    window.addEventListener('resize', function resize(event) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.draw();
    });

    // Create the canvas.
    var canvas = document.createElement('canvas');
    div.appendChild(canvas);
    this.canvas = canvas;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  _start() {
    // Create the stars.
    var stars = [];
    for(var i=0; i<this.stars; i++) {
      stars[i] = new Star(Math.random()*this.width, Math.random()*this.height, Math.random()*3+1,
       (Math.random()*(this.maxVelocity - this.minVelocity))+this.minVelocity);
    }
    this.stars = stars;

    // Start the timer.
    this.intervalId = setInterval(() => {
      this.update();
      this.draw();
    }, 1000 / this.fps);

    return this;
  }

  _stop() {
    clearInterval(this.intervalId);
    return this;
  }

  _update() {
    var dt = 1 / this.fps;

    for(var i=0; i<this.stars.length; i++) {
      var star = this.stars[i];
      star.y += dt * star.velocity;
      // If the star has moved from the bottom of the screen, spawn it at the top.
      if(star.y > this.height) {
        this.stars[i] = new Star(Math.random()*this.width, 0, Math.random()*3+1,
        (Math.random()*(this.maxVelocity - this.minVelocity))+this.minVelocity);
      }
    }

    return this;
  }

  _draw() {
    // Get the drawing context.
    var ctx = this.canvas.getContext("2d");

    // Draw the background.
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw stars.
    ctx.fillStyle = '#ffffff';
    for(var i=0; i<this.stars.length;i++) {
      var star = this.stars[i];
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    return this;
  }
}

class Star {
  constructor(x, y, size, velocity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.velocity = velocity;
  }
}

export const Starfield = React.createClass({
  displayName: 'Starfield',

  componentDidMount() {
    new StarfieldGenerator(
      document.getElementById('starfield')
    ).start()
  },

  render() {
    return <aside id="starfield"></aside>;
  }
});
