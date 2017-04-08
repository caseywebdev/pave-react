import {Store, toDelta} from 'pave';
import PaveSubscription from 'pave-subscription';
import PropTypes from 'prop-types';
import React, {Component as ReactComponent} from 'react';

let contextId = 0;

export const withPave = (Component, {
  createContextPaths = {},
  getCache = () => ({}),
  getQuery = () => {},
  params = {},
  store
} = {}) =>
  class extends ReactComponent {
    static static = Component;

    static childContextTypes = {
      paveContextPaths: PropTypes.object,
      paveStore: PropTypes.instanceOf(Store)
    };

    static contextTypes = {
      ...Component.contextTypes,
      paveContextPaths: PropTypes.object,
      paveStore: PropTypes.instanceOf(Store)
    };

    static propTypes = Component.propTypes;

    static defaultProps = Component.defaultProps;

    getChildContext() {
      return {
        paveContextPaths: this.getContextPaths(),
        paveStore: this.getStore()
      };
    }

    params = params;

    componentWillMount() {
      this.sub = new PaveSubscription({
        onChange: sub => {
          this.sub = sub;
          this.update();
        },
        query: this.getQuery(),
        store: this.getStore()
      });
    }

    componentWillReceiveProps(props, context) {
      this.props = props;
      this.context = context;
      this.update();
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
      if (deltas.length) {

        // Since `componentWillUnmount` fires top down, child components must be
        // given a tick to destroy their subscriptions to prevent unwanted
        // `onChange` callbacks from firing.
        setTimeout(() => this.getStore().update(deltas));
      }
    }

    getArgs() {
      const {context, params, props, sub = {}} = this;
      const {error = null, isLoading = false} = sub;
      const contextPaths = this.getContextPaths();
      const store = this.getStore();
      return {context, contextPaths, error, isLoading, params, props, store};
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
        setParams: ::this.setParams,
        store: this.getStore()
      };
    }

    setParams(params) {
      this.params = {...this.params, ...params};
      this.update();
    }

    update() {
      this.sub.setQuery(this.getQuery());
      this.setState({pave: this.getPave()});
    }

    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
