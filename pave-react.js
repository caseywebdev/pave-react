'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createComponent = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _paveSubscription = require('pave-subscription');

var _paveSubscription2 = _interopRequireDefault(_paveSubscription);

var _pave = require('pave');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var contextId = 0;

var createComponent = exports.createComponent = function createComponent(Component, _ref) {
  var _class, _temp2;

  var _ref$createContextPat = _ref.createContextPaths,
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
          paveStore: this.getStore(),
          paveContextPaths: this.getContextPaths()
        };
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this2 = this;

        this.sub = new _paveSubscription2.default({
          store: this.getStore(),
          query: this.getQuery(),
          onChange: function onChange(sub) {
            _this2.sub = sub;
            _this2.updatePave();
            sub.setQuery(_this2.getQuery());
          }
        });
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
        var paths = this.createdContextPaths;
        var deltas = [];
        for (var key in paths) {
          deltas.push((0, _pave.toDelta)(paths[key], { $unset: true }));
        }if (deltas.length) this.getStore().update(deltas);
      }
    }, {
      key: 'getArgs',
      value: function getArgs() {
        var context = this.context,
            params = this.params,
            props = this.props;

        var store = this.getStore();
        return { context: context, params: params, props: props, store: store };
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
            _sub = this.sub,
            error = _sub.error,
            isLoading = _sub.isLoading;

        return {
          cache: this.getCache(),
          contextPaths: this.getContextPaths(),
          error: error,
          isLoading: isLoading,
          params: params,
          reload: sub.reload.bind(sub),
          run: sub.run.bind(sub),
          setParams: this.setParams.bind(this),
          store: this.getStore()
        };
      }
    }, {
      key: 'updatePave',
      value: function updatePave() {
        this.setState({ pave: this.getPave() });
      }
    }, {
      key: 'setParams',
      value: function setParams(params) {
        this.params = _extends({}, this.params, { params: params });
        this.sub.setQuery(this.getQuery());
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(Component, _extends({}, this.props, this.state));
      }
    }]);

    return _class;
  }(_react.Component), _class.static = Component, _class.childContextTypes = {
    paveStore: _react.PropTypes.instanceOf(_pave.Store),
    paveContextPaths: _react.PropTypes.object
  }, _class.contextTypes = {
    paveStore: _react.PropTypes.instanceOf(_pave.Store),
    paveContextPaths: _react.PropTypes.object
  }, _temp2;
};
