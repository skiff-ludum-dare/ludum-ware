// Pollyfills
require('es6-promise').polyfill();
require('isomorphic-fetch');
require("babel-core/register");

import 'normalize.css'
import './index.css'


import React from 'react';
import {render} from 'react-dom';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import createLogger from 'redux-logger';

import reducer from './reducer';
import App from './App'

const store = createStore(
  reducer,
  applyMiddleware(ReduxThunk, createLogger())
);

render(
    <Provider store={store}>
      <App/>
    </Provider>
    , document.querySelector('#app'))
