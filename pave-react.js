'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContainer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pave = require('pave');

var _clone = require('pave/build/clone');

var _clone2 = _interopRequireDefault(_clone);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _update2 = require('pave/build/update');

var _update3 = _interopRequireDefault(_update2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Deferred = function Deferred() {
  var _this = this;

  _classCallCheck(this, Deferred);

  this.promise = new _pave.SyncPromise(function (resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
};

var isEqualSubset = function isEqualSubset(a, b) {
  for (var key in a) {
    if (a[key] !== b[key]) return false;
  }return true;
};

var isEqual = function isEqual(a, b) {
  return isEqualSubset(a, b) && isEqualSubset(b, a);
};

var flushProp = function flushProp(c) {
  if (!c.isStale && c.prevProp && isEqual(c.prop, c.prevProp)) return;

  var initialRender = !c.prevProp;
  c.prevProp = c.prop;
  c.prop = (0, _clone2.default)(c.prop);
  c.isStale = false;
  if (!initialRender) c.forceUpdate();
};

var shiftQueue = function shiftQueue(c) {
  var next = c.queue.shift();
  if (next) return _run(c, next.options, next.deferred);

  flushProp(c);
};

var _run = function _run(c) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var deferred = arguments.length <= 2 || arguments[2] === undefined ? new Deferred() : arguments[2];

  if (c.prop.isLoading) {
    c.queue.push({ options: options, deferred: deferred });
    flushProp(c);
    return deferred.promise;
  }

  var manual = options.manual;
  var _options$runOptions = options.runOptions;
  var runOptions = _options$runOptions === undefined ? {} : _options$runOptions;

  if (!manual) {
    var params = c.prop.params;

    runOptions.query = c.getQuery && c.getQuery(params);
    if (!runOptions.query) {
      c.store.unwatch(c.setStale);
      deferred.resolve();
      shiftQueue(c);
      return deferred.promise;
    }

    if (!runOptions.force && c.prevParams === params) {
      var error = c.prop.error;

      if (error) deferred.reject(error);else deferred.resolve();
      shiftQueue(c);
      return deferred.promise;
    }

    c.prevParams = params;
    c.store.watch(runOptions.query, c.setStale);
  }

  c.prop.error = null;
  c.prop.isLoading = true;
  c.store.run(runOptions).catch(function (error) {
    return c.prop.error = error;
  }).then(function () {
    c.prop.isLoading = false;
    var error = c.prop.error;

    if (error) deferred.reject(error);else deferred.resolve();
    shiftQueue(c);
  });

  flushProp(c);

  return deferred.promise;
};

var createContainer = exports.createContainer = function createContainer(_ref) {
  var getQuery = _ref.getQuery;
  var getInitialParams = _ref.getInitialParams;
  var store = _ref.store;
  return function (Component) {
    var _class, _temp2;

    return _temp2 = _class = function (_ReactComponent) {
      _inherits(_class, _ReactComponent);

      function _class() {
        var _Object$getPrototypeO;

        var _temp, _this2, _ret;

        _classCallCheck(this, _class);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(_class)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this2), _this2.store = store, _this2.getQuery = getQuery, _this2.queue = [], _this2.prop = {
          isLoading: false,

          error: null,

          params: {},

          update: function update(delta) {
            _this2.prop.params = (0, _update3.default)(_this2.prop.params, delta);
            return _run(_this2);
          },

          reload: function reload() {
            return _run(_this2, { runOptions: { force: true } });
          },

          run: function run(runOptions) {
            return _run(_this2, { manual: true, runOptions: runOptions });
          }
        }, _this2.setStale = function () {
          _this2.isStale = true;
          if (!_this2.prop.isLoading) flushProp(_this2);
        }, _temp), _possibleConstructorReturn(_this2, _ret);
      }

      _createClass(_class, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          var context = this.context;
          var props = this.props;
          var update = this.prop.update;

          update({ $set: (getInitialParams || function () {
              return {};
            })(props, context) });
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.store.unwatch(this.setStale);
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(Component, _extends({}, this.props, { pave: this.prop }));
        }
      }]);

      return _class;
    }(_react.Component), _class.contextTypes = Component.contextTypes, _temp2;
  };
};
