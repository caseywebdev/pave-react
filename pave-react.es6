import 'setimmediate';
import {Store, toDelta} from 'pave';
import PaveSubscription from 'pave-subscription';
import PropTypes from 'prop-types';
import React, {Component as ReactComponent} from 'react';

let contextId = 0;

export const withPave = (Component, {
  createContextPaths = {},
  getState = () => ({}),
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
        onChange: this.update,
        query: this.getState().$query,
        store: this.getStore()
      });
      this.reload = ::this.sub.reload;
      this.update();
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
        setImmediate(() => this.getStore().update(deltas));
      }
    }

    getArgs() {
      return {
        context: this.context,
        contextPaths: this.getContextPaths(),
        error: this.sub ? this.sub.error : null,
        isLoading: this.sub ? this.sub.isLoading : false,
        params: this.params,
        props: this.props,
        reload: this.reload,
        setParams: this.setParams,
        store: this.getStore()
      };
    }

    getState(args = this.getArgs()) {
      return getState(args);
    }

    getPave() {
      const args = this.getArgs();
      args.state = this.getState(args);
      return args;
    }

    setParams = params => {
      this.params = {...this.params, ...params};
      this.update();
    }

    update = () => {
      if (!this.sub) return;

      const pave = this.getPave();
      this.setState({pave});
      this.sub.setQuery(pave.state.$query);
    }

    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
