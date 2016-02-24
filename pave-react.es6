import {Component as ReactComponent} from 'react';
import {toKey} from 'pave';

export class Component extends ReactComponent {
  state = {};

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
    if (!this.getPaveState) return;

    const state = this.getPaveState();
    const stateKey = toKey(state);
    if (stateKey === this.prevPaveStateKey) return;

    this.prevPaveStateKey = stateKey;
    this.setState(state);
  }

  updatePaveQuery({force = false} = {}) {
    if (!this.getPaveQuery) return;

    if (this.isLoading) return this.pendingUpdatePaveQuery = true;

    const query = this.getPaveQuery();
    const queryKey = toKey(query);
    if (!force && queryKey === this.prevPaveQueryKey) return;

    this.isLoading = true;
    this.prevPaveQueryKey = queryKey;

    let state = {isLoading: true, error: null};
    const setState = () => {
      const stateKey = toKey(state);
      if (stateKey === this.prevPaveQueryStateKey) return;

      this.prevPaveQueryStateKey = stateKey;
      this.setState(state);
    };

    const done = error => {
      state = {isLoading: this.isLoading = false, error};
      setState();
      this.updatePaveState();
      if (this.pendingUpdatePaveQuery) {
        this.pendingUpdatePaveQuery = false;
        this.updatePaveQuery();
      }
    };

    this.store.run({force, query}).then(() => done(null), done);

    setState();
  }

  updatePave = () => {
    this.updatePaveState();
    this.updatePaveQuery();
  }
}
