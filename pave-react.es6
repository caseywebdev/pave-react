import {Component as ReactComponent} from 'react';
import {toKey} from 'pave';

export class Component extends ReactComponent {
  componentWillMount() {
    this.store.on('change', this.runPaths);
    this.runPaths();
    this.runQuery();
  }

  componentDidUpdate() {
    this.runPaths();
    this.runQuery();
  }

  componentWillUnmount() {
    this.store.off('change', this.runPaths);
  }

  runPaths = () => {
    if (!this.getPaths) return;

    const paths = this.getPaths();
    const state = {};
    for (let key in paths) state[key] = this.store.get(paths[key]);
    const pathsKey = toKey(state);
    if (pathsKey === this.prevPathsKey) return;

    this.prevPathsKey = pathsKey;
    this.setState(state);
  }

  runQuery({force = false} = {}) {
    if (!this.getQuery || this.isLoading) return;

    const query = this.getQuery();
    const queryKey = toKey(query);
    if (!force && queryKey === this.prevQueryKey) return;

    this.prevQueryKey = queryKey;
    let state = {isLoading: true, error: null};

    const setState = () => {
      const {isLoading, error} = this.state || {};
      if (state.isLoading !== isLoading || state.error !== error) {
        this.setState(state);
      }
    };

    const done = error => {
      this.runPaths();
      state = {isLoading: this.isLoading = false, error};
      setState();
    };

    this.store.run({force, query}).then(() => done(null), done);

    setState();
  }
}
