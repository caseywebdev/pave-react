'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _pave = require('pave');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var setPaveState = function setPaveState(c, state) {
  for (var key in state) {
    c.paveState[key] = state[key];
  }
};

var applyPaveState = function applyPaveState(c) {
  var stateKey = (0, _pave.toKey)(c.paveState);
  if (stateKey === c.prevPaveStateKey) return;

  c.prevPaveStateKey = stateKey;
  if (c._reactInternalInstance) c.setState(c.paveState);
};

var updatePaveState = function updatePaveState(c) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (!c.getPaveState) return;

  var _options$props = options.props;
  var props = _options$props === undefined ? c.props : _options$props;
  var _options$context = options.context;
  var context = _options$context === undefined ? c.context : _options$context;

  setPaveState(c, c.getPaveState(props, context));
};

var shiftQueue = function shiftQueue(c) {
  var next = c.paveQueue.shift();
  if (next) return updatePaveQuery(c, next.options, next.deferred);

  applyPaveState(c);
};

var updatePaveQuery = function updatePaveQuery(c) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var deferred = arguments.length <= 2 || arguments[2] === undefined ? new Deferred() : arguments[2];

  if (c.paveState.isLoading) {
    c.paveQueue.push({ options: options, deferred: deferred });
    applyPaveState(c);
    return deferred.promise;
  }

  var _options$context2 = options.context;
  var context = _options$context2 === undefined ? c.context : _options$context2;
  var _options$force = options.force;
  var force = _options$force === undefined ? false : _options$force;
  var _options$props2 = options.props;
  var props = _options$props2 === undefined ? c.props : _options$props2;

  var query = c.getPaveQuery && c.getPaveQuery(props, context);
  if (!query) {
    deferred.resolve();
    shiftQueue(c);
    return deferred.promise;
  }

  var key = (0, _pave.toKey)(query);
  if (!force && c.paveKey === key) {
    var error = c.paveState.error;

    if (error) deferred.reject(error);else deferred.resolve();
    shiftQueue(c);
    return deferred.promise;
  }

  setPaveState(c, { isLoading: true, error: null });

  c.store.run({ query: query, force: force }).catch(function (error) {
    return setPaveState(c, { error: error });
  }).then(function () {
    c.paveKey = key;
    setPaveState(c, { isLoading: false });
    updatePaveState(c);
    var error = c.paveState.error;

    if (error) deferred.reject(error);else deferred.resolve();
    shiftQueue(c);
  });

  applyPaveState(c);

  return deferred.promise;
};

var updatePave = function updatePave(c, options) {
  updatePaveState(c, options);
  return updatePaveQuery(c, options);
};

var Deferred = function Deferred() {
  var _this = this;

  _classCallCheck(this, Deferred);

  this.promise = new _pave.SyncPromise(function (resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
};

var Component = exports.Component = function (_ReactComponent) {
  _inherits(Component, _ReactComponent);

  function Component() {
    var _Object$getPrototypeO;

    var _temp, _this2, _ret;

    _classCallCheck(this, Component);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Component)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this2), _this2.paveState = {}, _this2.paveQueue = [], _this2._autoUpdatePave = function (options) {
      return updatePave(_this2, options);
    }, _temp), _possibleConstructorReturn(_this2, _ret);
  }

  _createClass(Component, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.store.on('change', this._autoUpdatePave);
      this._autoUpdatePave();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props, context) {
      this._autoUpdatePave({ props: props, context: context });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._autoUpdatePave();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.store.off('change', this._autoUpdatePave);
    }
  }, {
    key: 'reloadPave',
    value: function reloadPave() {
      return updatePave(this, { force: true });
    }
  }]);

  return Component;
}(_react.Component);
