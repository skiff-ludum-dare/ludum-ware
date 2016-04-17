// Pollyfills
require('es6-promise').polyfill();
require('isomorphic-fetch');
require("babel-core/register");

import 'normalize.css'
import './index.css'


import React from 'react';
import {render} from 'react-dom';

import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import createLogger from 'redux-logger';
import DevTools from './DevTools';
import reducer from './reducer';
import App from './App'
import {serverEvents} from './api';
import {gameStateUpdate} from './actions';

const store = compose(applyMiddleware(ReduxThunk), DevTools.instrument())(createStore)(reducer);
// const store = createStore(reducer, {}, enhancer);
// window._store = store;

serverEvents.on('gameState', gameState => {
  store.dispatch(gameStateUpdate(gameState));
});

render(
    <Provider store={store}>
      <div>
        <App/>
        <DevTools />
      </div>
    </Provider>
    , document.querySelector('#app'))
