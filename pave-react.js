'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
  c.setState(c.paveState);
};

var updatePaveState = function updatePaveState(c) {
  if (c.getPaveState) setPaveState(c, c.getPaveState());
};

var updatePaveQuery = function updatePaveQuery(c) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var deferred = arguments.length <= 2 || arguments[2] === undefined ? new Deferred() : arguments[2];

  if (!options.query && c.getPaveQuery) {
    options = _extends({}, options, { query: c.getPaveQuery() });
  }

  if (!options.query) {
    applyPaveState(c);
    deferred.resolve();
  } else if (c.paveState.isLoading) {
    c.paveQueue.push({ options: options, deferred: deferred });
  } else {
    setPaveState(c, { isLoading: true, error: null });
    var run = c.store.run(options);
    run.catch(function (error) {
      return setPaveState(c, { error: error });
    }).then(function () {
      setPaveState(c, { isLoading: false });
      updatePaveState(c);
      var next = c.paveQueue.shift();
      if (!next) return applyPaveState(c);
      updatePaveQuery(c, next.options, next.deferred);
    });
    applyPaveState(c);
    run.then(deferred.resolve, deferred.reject);
  }

  return deferred.promise;
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

    return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Component)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this2), _this2.paveState = {}, _this2.paveQueue = [], _this2.updatePave = function (options) {
      updatePaveState(_this2);
      return updatePaveQuery(_this2, options);
    }, _temp), _possibleConstructorReturn(_this2, _ret);
  }

  _createClass(Component, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.store.on('change', this.updatePave);
      this.updatePave();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.updatePave();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.store.off('change', this.updatePave);
    }
  }]);

  return Component;
}(_react.Component);
