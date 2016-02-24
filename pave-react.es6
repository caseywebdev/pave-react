import {Component as ReactComponent} from 'react';
import {toKey} from 'pave';

export class Component extends ReactComponent {
  paveState = {};

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

  updatePaveState() {
    if (this.getPaveState) this.setPaveState(this.getPaveState());
  }

  updatePaveQuery() {
    if (!this.getPaveQuery) return this.applyPaveState();

    if (this.paveState.isLoading) return this.pendingUpdatePaveQuery = true;

    const query = this.getPaveQuery();
    const queryKey = toKey(query);
    if (queryKey === this.prevPaveQueryKey) return this.applyPaveState();

    this.prevPaveQueryKey = queryKey;
    this.setPaveState({isLoading: true, error: null});

    const done = error => {
      this.setPaveState({isLoading: false, error});
      this.updatePaveState();
      if (!this.pendingUpdatePaveQuery) return this.applyPaveState();

      this.pendingUpdatePaveQuery = false;
      this.updatePaveQuery();
    };

    this.store.run({query}).then(() => done(null), done);

    this.applyPaveState();
  }

  updatePave = () => {
    this.updatePaveState();
    this.updatePaveQuery();
  }

  setPaveState(state) {
    for (let key in state) this.paveState[key] = state[key];
  }

  applyPaveState() {
    const stateKey = toKey(this.paveState);
    if (stateKey === this.prevPaveStateKey) return;

    this.prevPaveStateKey = stateKey;
    this.setState(this.paveState);
  }
}
