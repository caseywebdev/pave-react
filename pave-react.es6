import {Component as ReactComponent} from 'react';
import {SyncPromise, toKey} from 'pave';

const setPaveState = (c, state) => {
  for (let key in state) c.paveState[key] = state[key];
};

const applyPaveState = c => {
  const stateKey = toKey(c.paveState);
  if (stateKey === c.prevPaveStateKey) return;

  c.prevPaveStateKey = stateKey;
  c.setState(c.paveState);
};

const updatePaveState = c => {
  if (c.getPaveState) setPaveState(c, c.getPaveState());
};

const updatePaveQuery = (c, options = {}, deferred = new Deferred()) => {
  if (!options.query && c.getPaveQuery) {
    options = {...options, query: c.getPaveQuery()};
  }

  if (!options.query) {
    applyPaveState(c);
    deferred.resolve();
  } else if (c.paveState.isLoading) {
    c.paveQueue.push({options, deferred});
  } else {
    setPaveState(c, {isLoading: true, error: null});
    const run = c.store.run(options);
    run.catch(error => setPaveState(c, {error})).then(() => {
      setPaveState(c, {isLoading: false});
      updatePaveState(c);
      const next = c.paveQueue.shift();
      if (next) return updatePaveQuery(c, next.options, next.deferred);

      applyPaveState(c);
    });

    applyPaveState(c);
    run.then(deferred.resolve, deferred.reject);
  }

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

  componentDidUpdate() {
    this.updatePave();
  }

  componentWillUnmount() {
    this.store.off('change', this.updatePave);
  }

  updatePave = options => {
    updatePaveState(this);
    return updatePaveQuery(this, options);
  }
}
