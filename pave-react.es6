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

    if (this.isLoading) return this.pendingPaveQuery = true;
    this.pendingPaveQuery = false;

    const query = this.getPaveQuery();
    const queryKey = toKey(query);
    if (!force && queryKey === this.prevPaveQueryKey) return;

    this.prevPaveQueryKey = queryKey;
    let isDone = false;
    const done = error => {
      isDone = true;
      this.setState({isLoading: this.isLoading = false, error});
      this.updatePaveState();
      if (this.pendingPaveQuery) this.updatePaveQuery();
    };

    this.store.run({force, query}).then(() => done(null), done);

    if (!isDone) this.setState({isLoading: true, error: null});
  }

  updatePave = () => {
    this.updatePaveState();
    this.updatePaveQuery();
  }
}
