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

const updatePaveWatchQuery = (c, options = {}) => {
  if (!c.getPaveWatchQuery) return;

  const {props = c.props, context = c.context} = options;
  const query = c.getPaveWatchQuery(props, context);
  const key = toKey(query);
  if (key === c.prevPaveWatchQueryKey) return;

  c.prevPaveWatchQueryKey = key;
  if (query) c.store.watch(query, c._autoUpdatePave);
  else c.store.unwatch(c._autoUpdatePave);
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
    applyPaveState(c);
    return deferred.promise;
  }

  const {context = c.context, force = false, props = c.props} = options;
  const query = c.getPaveQuery && c.getPaveQuery(props, context);
  if (!query) {
    deferred.resolve();
    shiftQueue(c);
    return deferred.promise;
  }

  const key = toKey(query);
  if (!force && c.paveKey === key) {
    const {error} = c.paveState;
    if (error) deferred.reject(error); else deferred.resolve();
    shiftQueue(c);
    return deferred.promise;
  }

  setPaveState(c, {isLoading: true, error: null});

  c.store.run({query, force})
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

const updatePave = (c, options) => {
  updatePaveWatchQuery(c, options);
  updatePaveState(c, options);
  return updatePaveQuery(c, options);
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
  _autoUpdatePave = () => updatePave(this);

  componentWillMount() {
    updatePave(this);
  }

  componentWillReceiveProps(props, context) {
    updatePave(this, {props, context});
  }

  componentDidUpdate() {
    updatePave(this);
  }

  componentWillUnmount() {
    this.store.unwatch(this._autoUpdatePave);
  }

  reloadPave() {
    return updatePave(this, {force: true});
  }
}
