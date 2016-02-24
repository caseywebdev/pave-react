'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _pave = require('pave');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = exports.Component = function (_ReactComponent) {
  _inherits(Component, _ReactComponent);

  function Component() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Component);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Component)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {}, _this.updatePave = function () {
      _this.updatePaveState();
      _this.updatePaveQuery();
    }, _temp), _possibleConstructorReturn(_this, _ret);
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
  }, {
    key: 'updatePaveState',
    value: function updatePaveState() {
      if (!this.getPaveState) return;

      var state = this.getPaveState();
      var stateKey = (0, _pave.toKey)(state);
      if (stateKey === this.prevPaveStateKey) return;

      this.prevPaveStateKey = stateKey;
      this.setState(state);
    }
  }, {
    key: 'updatePaveQuery',
    value: function updatePaveQuery() {
      var _this2 = this;

      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$force = _ref.force;
      var force = _ref$force === undefined ? false : _ref$force;

      if (!this.getPaveQuery) return;

      if (this.isLoading) return this.pendingUpdatePaveQuery = true;

      var query = this.getPaveQuery();
      var queryKey = (0, _pave.toKey)(query);
      if (!force && queryKey === this.prevPaveQueryKey) return;

      this.isLoading = true;
      this.prevPaveQueryKey = queryKey;

      var state = { isLoading: true, error: null };
      var setState = function setState() {
        var stateKey = (0, _pave.toKey)(state);
        if (stateKey === _this2.prevPaveQueryStateKey) return;

        _this2.prevPaveQueryStateKey = stateKey;
        _this2.setState(state);
      };

      var done = function done(error) {
        state = { isLoading: _this2.isLoading = false, error: error };
        setState();
        _this2.updatePaveState();
        if (_this2.pendingUpdatePaveQuery) {
          _this2.pendingUpdatePaveQuery = false;
          _this2.updatePaveQuery();
        }
      };

      this.store.run({ force: force, query: query }).then(function () {
        return done(null);
      }, done);

      setState();
    }
  }]);

  return Component;
}(_react.Component);
