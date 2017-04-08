'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withPave = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pave = require('pave');

var _paveSubscription = require('pave-subscription');

var _paveSubscription2 = _interopRequireDefault(_paveSubscription);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var contextId = 0;

var withPave = exports.withPave = function withPave(Component) {
  var _class, _temp2;

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$createContextPat = _ref.createContextPaths,
      createContextPaths = _ref$createContextPat === undefined ? {} : _ref$createContextPat,
      _ref$getCache = _ref.getCache,
      _getCache = _ref$getCache === undefined ? function () {
    return {};
  } : _ref$getCache,
      _ref$getQuery = _ref.getQuery,
      _getQuery = _ref$getQuery === undefined ? function () {} : _ref$getQuery,
      _ref$params = _ref.params,
      params = _ref$params === undefined ? {} : _ref$params,
      store = _ref.store;

  return _temp2 = _class = function (_ReactComponent) {
    _inherits(_class, _ReactComponent);

    function _class() {
      var _ref2;

      var _temp, _this, _ret;

      _classCallCheck(this, _class);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref2, [this].concat(args))), _this), _this.params = params, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class, [{
      key: 'getChildContext',
      value: function getChildContext() {
        return {
          paveContextPaths: this.getContextPaths(),
          paveStore: this.getStore()
        };
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this2 = this;

        this.sub = new _paveSubscription2.default({
          onChange: function onChange(sub) {
            _this2.sub = sub;
            _this2.update();
          },
          query: this.getQuery(),
          store: this.getStore()
        });
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(props, context) {
        this.props = props;
        this.context = context;
        this.update();
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.sub.destroy();
        this.unsetCreatedContextPaths();
      }
    }, {
      key: 'getStore',
      value: function getStore() {
        if (this.store) return this.store;

        this.store = store || this.props.paveStore || this.context.paveStore;
        if (!this.store) throw new Error('A Pave store is required');

        return this.store;
      }
    }, {
      key: 'getContextPaths',
      value: function getContextPaths() {
        if (this.contextPaths) return this.contextPaths;

        var inherited = this.context.paveContextPaths;
        var created = {};
        for (var key in createContextPaths) {
          var _createContextPaths$k = createContextPaths[key],
              _createContextPaths$k2 = _createContextPaths$k.inherit,
              inherit = _createContextPaths$k2 === undefined ? false : _createContextPaths$k2,
              _createContextPaths$k3 = _createContextPaths$k.prefix,
              prefix = _createContextPaths$k3 === undefined ? [] : _createContextPaths$k3;

          if (!inherit || !inherited[key]) {
            created[key] = prefix.concat(key + '-' + ++contextId);
          }
        }

        this.createdContextPaths = created;

        return this.contextPaths = _extends({}, inherited, created);
      }
    }, {
      key: 'unsetCreatedContextPaths',
      value: function unsetCreatedContextPaths() {
        var _this3 = this;

        var paths = this.createdContextPaths;
        var deltas = [];
        for (var key in paths) {
          deltas.push((0, _pave.toDelta)(paths[key], { $unset: true }));
        }if (deltas.length) {

          // Since `componentWillUnmount` fires top down, child components must be
          // given a tick to destroy their subscriptions to prevent unwanted
          // `onChange` callbacks from firing.
          setTimeout(function () {
            return _this3.getStore().update(deltas);
          });
        }
      }
    }, {
      key: 'getArgs',
      value: function getArgs() {
        var context = this.context,
            params = this.params,
            props = this.props,
            _sub = this.sub,
            sub = _sub === undefined ? {} : _sub;
        var _sub$error = sub.error,
            error = _sub$error === undefined ? null : _sub$error,
            _sub$isLoading = sub.isLoading,
            isLoading = _sub$isLoading === undefined ? false : _sub$isLoading;

        var contextPaths = this.getContextPaths();
        var store = this.getStore();
        return { context: context, contextPaths: contextPaths, error: error, isLoading: isLoading, params: params, props: props, store: store };
      }
    }, {
      key: 'getCache',
      value: function getCache() {
        return _getCache(this.getArgs());
      }
    }, {
      key: 'getQuery',
      value: function getQuery() {
        return _getQuery(this.getArgs());
      }
    }, {
      key: 'getPave',
      value: function getPave() {
        var params = this.params,
            sub = this.sub,
            _sub2 = this.sub,
            error = _sub2.error,
            isLoading = _sub2.isLoading;

        return {
          cache: this.getCache(),
          contextPaths: this.getContextPaths(),
          error: error,
          isLoading: isLoading,
          params: params,
          reload: sub.reload.bind(sub),
          setParams: this.setParams.bind(this),
          store: this.getStore()
        };
      }
    }, {
      key: 'setParams',
      value: function setParams(params) {
        this.params = _extends({}, this.params, params);
        this.update();
      }
    }, {
      key: 'update',
      value: function update() {
        this.sub.setQuery(this.getQuery());
        this.setState({ pave: this.getPave() });
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(Component, _extends({}, this.props, this.state));
      }
    }]);

    return _class;
  }(_react.Component), _class.static = Component, _class.childContextTypes = {
    paveContextPaths: _propTypes2.default.object,
    paveStore: _propTypes2.default.instanceOf(_pave.Store)
  }, _class.contextTypes = _extends({}, Component.contextTypes, {
    paveContextPaths: _propTypes2.default.object,
    paveStore: _propTypes2.default.instanceOf(_pave.Store)
  }), _class.propTypes = Component.propTypes, _class.defaultProps = Component.defaultProps, _temp2;
};
