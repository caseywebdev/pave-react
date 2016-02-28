import {Component as ReactComponent} from 'react';
import {SyncPromise, toKey} from 'pave';

const setPaveState = (c, state) => {
  for (let key in state) c.paveState[key] = state[key];
};

const applyPaveState = c => {
  const stateKey = toKey(c.paveState);
  if (stateKey === c.prevPaveStateKey) return;

  c.prevPaveStateKey = stateKey;
  if (c._reactInternalInstance) c.setState(c.paveState);
};

const updatePaveState = (c, options = {}) => {
  if (!c.getPaveState) return;
  const {props = c.props, context = c.context} = options;
  setPaveState(c, c.getPaveState(props, context));
};

const shiftQueue = c => {
  const next = c.paveQueue.shift();
  if (next) return updatePaveQuery(c, next.options, next.deferred);
  applyPaveState(c);
};

const updatePaveQuery = (c, options = {}, deferred = new Deferred()) => {
  if (c.paveState.isLoading) {
    c.paveQueue.push({options, deferred});
    return deferred.promise;
  }

  let {runOptions = {}, props = c.props, context = c.context} = options;
  if (!runOptions.query && c.getPaveQuery) {
    runOptions = {...runOptions, query: c.getPaveQuery(props, context)};
  }

  if (!runOptions.query) {
    deferred.resolve();
    shiftQueue(c);
    return deferred.promise;
  }

  const key = toKey(runOptions);
  if (!runOptions.force && c.paveKey === key) {
    const {error} = c.paveState;
    if (error) deferred.reject(error); else deferred.resolve();
    shiftQueue(c);
    return deferred.promise;
  }

  setPaveState(c, {isLoading: true, error: null});
  c.store.run(runOptions)
    .catch(error => setPaveState(c, {error}))
    .then(() => {
      c.paveKey = key;
      setPaveState(c, {isLoading: false});
      updatePaveState(c);
      const {error} = c.paveState;
      if (error) deferred.reject(error); else deferred.resolve();
      shiftQueue(c);
    });
  applyPaveState(c);
  return deferred.promise;
};

class Deferred {
  constructor() {
    this.promise = new SyncPromise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export class Component extends ReactComponent {
  paveState = {};
  paveQueue = [];

  componentWillMount() {
    this.store.on('change', this.updatePave);
    this.updatePave();
  }

  componentWillReceiveProps(props, context) {
    this.updatePave(null, {props, context});
  }

  componentDidUpdate() {
    this.updatePave();
  }

  componentWillUnmount() {
    this.store.off('change', this.updatePave);
  }

  updatePave = (runOptions, options) => {
    updatePaveState(this, options);
    if (runOptions) options = {runOptions, ...options};
    return updatePaveQuery(this, options);
  }
}
