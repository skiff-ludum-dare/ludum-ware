require('es6-promise').polyfill();
require('isomorphic-fetch');
import 'normalize.css'
import './index.css'


import React from 'react';
import {render} from 'react-dom';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import createLogger from 'redux-logger';

import {reducer} from './state';
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
