import PaveSubscription from 'pave-subscription';
import {Store, toDelta} from 'pave';
import React, {Component as ReactComponent, PropTypes} from 'react';

let contextId = 0;

export const createComponent = (Component, {
  createContextPaths = {},
  getCache = () => ({}),
  getQuery = () => {},
  params = {},
  store
}) =>
  class extends ReactComponent {
    static static = Component;

    static childContextTypes = {
      paveStore: PropTypes.instanceOf(Store),
      paveContextPaths: PropTypes.object
    };

    static contextTypes = {
      paveStore: PropTypes.instanceOf(Store),
      paveContextPaths: PropTypes.object
    };

    getChildContext() {
      return {
        paveStore: this.getStore(),
        paveContextPaths: this.getContextPaths()
      };
    }

    params = params;

    componentWillMount() {
      this.sub = new PaveSubscription({
        store: this.getStore(),
        query: this.getQuery(),
        onChange: sub => {
          this.sub = sub;
          this.updatePave();
          sub.setQuery(this.getQuery());
        }
      });
    }

    componentWillUnmount() {
      this.sub.destroy();
      this.unsetCreatedContextPaths();
    }

    getStore() {
      if (this.store) return this.store;

      this.store = store || this.props.paveStore || this.context.paveStore;
      if (!this.store) throw new Error('A Pave store is required');

      return this.store;
    }

    getContextPaths() {
      if (this.contextPaths) return this.contextPaths;

      const inherited = this.context.paveContextPaths;
      const created = {};
      for (let key in createContextPaths) {
        const {inherit = false, prefix = []} = createContextPaths[key];
        if (!inherit || !inherited[key]) {
          created[key] = prefix.concat(`${key}-${++contextId}`);
        }
      }

      this.createdContextPaths = created;

      return this.contextPaths = {...inherited, ...created};
    }

    unsetCreatedContextPaths() {
      const paths = this.createdContextPaths;
      const deltas = [];
      for (let key in paths) deltas.push(toDelta(paths[key], {$unset: true}));
      if (deltas.length) this.getStore().update(deltas);
    }

    getArgs() {
      const {context, params, props} = this;
      const contextPaths = this.getContextPaths();
      const store = this.getStore();
      return {context, contextPaths, params, props, store};
    }

    getCache() {
      return getCache(this.getArgs());
    }

    getQuery() {
      return getQuery(this.getArgs());
    }

    getPave() {
      const {params, sub, sub: {error, isLoading}} = this;
      return {
        cache: this.getCache(),
        contextPaths: this.getContextPaths(),
        error,
        isLoading,
        params,
        reload: ::sub.reload,
        run: ::sub.run,
        setParams: ::this.setParams,
        store: this.getStore()
      };
    }

    updatePave() {
      this.setState({pave: this.getPave()});
    }

    setParams(params) {
      this.params = {...this.params, params};
      this.sub.setQuery(this.getQuery());
    }

    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
