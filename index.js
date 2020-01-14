import React, { Component } from "react";
import { render } from "react-dom";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { connect, Provider } from "react-redux";
import "./style.css";

import { createReduxWorker, WORKER_UPDATE } from "./redux-worker";
import wStore from "./store";

const countReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case WORKER_UPDATE:
      return { count: action.payload.update };
    default:
      return state;
  }
};

const reducers = combineReducers({
  counter: countReducer
});

const actions = {
  inc: () => ({ type: "INC", thread: true }),
  dec: () => ({ type: "DEC", thread: true })
};

const store = createStore(
  reducers,
  applyMiddleware(createReduxWorker(wStore, 0))
);

class App extends Component {
  render() {
    return (
      <div>
        <button onClick={this.props.inc}>Increment</button>
        <button onClick={this.props.dec}>Decrement</button>
        <div>Value: {this.props.count}</div>
      </div>
    );
  }
}

const mapStateToProps = ({ counter }) => {
  return { count: counter.count };
};

const AppContainer = connect(
  mapStateToProps,
  actions
)(App);

render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById("root")
);
