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

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Component)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.runPaths = function () {
      if (!_this.getPaths) return;

      var paths = _this.getPaths();
      var state = {};
      for (var key in paths) {
        state[key] = _this.store.get(paths[key]);
      }var pathsKey = (0, _pave.toKey)(state);
      if (pathsKey === _this.prevPathsKey) return;

      _this.prevPathsKey = pathsKey;
      _this.setState(state);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Component, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.store.on('change', this.runPaths);
      this.runPaths();
      this.runQuery();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.runPaths();
      this.runQuery();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.store.off('change', this.runPaths);
    }
  }, {
    key: 'runQuery',
    value: function runQuery() {
      var _this2 = this;

      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$force = _ref.force;
      var force = _ref$force === undefined ? false : _ref$force;

      if (!this.getQuery || this.isLoading) return;

      var query = this.getQuery();
      var queryKey = (0, _pave.toKey)(query);
      if (!force && queryKey === this.prevQueryKey) return;

      this.prevQueryKey = queryKey;
      var state = { isLoading: true, error: null };

      var setState = function setState() {
        var _ref2 = _this2.state || {};

        var isLoading = _ref2.isLoading;
        var error = _ref2.error;

        if (state.isLoading !== isLoading || state.error !== error) {
          _this2.setState(state);
        }
      };

      var done = function done(error) {
        _this2.runPaths();
        state = { isLoading: _this2.isLoading = false, error: error };
        setState();
      };

      this.store.run({ force: force, query: query }).then(function () {
        return done(null);
      }, done);

      setState();
    }
  }]);

  return Component;
}(_react.Component);
