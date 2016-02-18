import {Component as ReactComponent} from 'react';
import {toKey} from 'pave';

export class Component extends ReactComponent {
  state = {};

  componentWillMount() {
    this.store.on('change', this.updatePaveState);
    this.updatePaveState();
    this.runPaveQuery();
  }

  componentDidUpdate() {
    this.updatePaveState();
    this.runPaveQuery();
  }

  componentWillUnmount() {
    this.store.off('change', this.updatePaveState);
  }

  updatePaveState = () => {
    if (!this.getPaveState) return;

    const state = this.getPaveState();
    const stateKey = toKey(state);
    if (stateKey === this.prevPaveStateKey) return;

    this.prevPaveStateKey = stateKey;
    this.setState(state);
  }

  runPaveQuery({force = false} = {}) {
    if (!this.getPaveQuery || this.isLoading) return;

    const query = this.getPaveQuery();
    const queryKey = toKey(query);
    if (!force && queryKey === this.prevPaveQueryKey) return;

    this.prevPaveQueryKey = queryKey;
    let state = {isLoading: true, error: null};

    const setState = () => {
      const {isLoading, error} = this.state || {};
      if (state.isLoading !== isLoading || state.error !== error) {
        this.setState(state);
      }
    };

    const done = error => {
      this.updatePaveState();
      state = {isLoading: this.isLoading = false, error};
      setState();
    };

    this.store.run({force, query}).then(() => done(null), done);

    setState();
  }
}
