import PaveSubscription from 'pave-subscription';
import {Store} from 'pave';
import React, {Component as ReactComponent, PropTypes} from 'react';

export const createComponent = (Component, {
  getQuery = () => {},
  getCache = () => ({}),
  params = {},
  store
}) =>
  class extends ReactComponent {
    static static = Component;

    static childContextTypes = {
      store: PropTypes.instanceOf(Store)
    };

    static contextTypes = {
      store: PropTypes.instanceOf(Store)
    };

    getChildContext() {
      return {store: this.getStore()};
    }

    params = params;

    componentWillMount() {
      this.updatePave();
      this.sub = new PaveSubscription({
        store: this.getStore(),
        query: this.getQuery(),
        onChange: sub => {
          this.updatePave();
          sub.setQuery(this.getQuery());
        }
      });
    }

    componentWillUnmount() {
      this.sub.destroy();
    }

    getStore() {
      if (!store) store = this.props.paveStore || this.context.paveStore;
      if (!store) throw new Error('A Pave store is required');

      return store;
    }

    getArgs() {
      const {context, props, state: {params}} = this;
      const store = this.getStore();
      return {context, params, props, store};
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
