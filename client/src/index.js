require('es6-promise').polyfill();
require('isomorphic-fetch');

import React from 'react'
import {render} from 'react-dom'

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk'

import {reducer} from './state';
import App from './App'


const store = createStore(
  reducer,
  applyMiddleware(ReduxThunk)
);

render(
    <Provider store={store}>
      <App/>
    </Provider>
    , document.querySelector('#app'))
