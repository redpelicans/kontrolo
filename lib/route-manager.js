'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.Route = Route;
exports.RouteManager = RouteManager;

var _authManager = require('../lib/auth-manager');

var _authManager2 = _interopRequireDefault(_authManager);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function Route() {
  for (var _len = arguments.length, elt = Array(_len), _key = 0; _key < _len; _key++) {
    elt[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(RouteKlass, [null].concat(elt)))();
}

function RouteManager(routes, options) {
  return new RouteManagerKlass(routes, options);
}

var Node = function () {
  function Node() {
    _classCallCheck(this, Node);
  }

  _createClass(Node, [{
    key: 'isRoot',
    value: function isRoot() {
      return !this._rparent;
    }
  }, {
    key: 'fullName',
    get: function get() {
      function tn(node) {
        if (node.isRoot()) return '';
        return tn(node._rparent) + '.' + node.name;
      }
      return tn(this).slice(1);
    }
  }]);

  return Node;
}();

var RouteKlass = function (_Node) {
  _inherits(RouteKlass, _Node);

  function RouteKlass() {
    var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, RouteKlass);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RouteKlass).call(this));

    _lodash2.default.extend(_this, _lodash2.default.pick(attrs, 'name', 'path', 'topic', 'defaultRoute', 'label', 'component', 'isMenu', 'iconName', 'authRequired', 'authRoles', 'authMethod'));
    return _this;
  }

  _createClass(RouteKlass, [{
    key: 'isAuthRequired',
    value: function isAuthRequired() {
      return this.authRequired || this.authRoles && this.authRoles.length || this.authMethod;
    }
  }, {
    key: 'registerToAuthManager',
    value: function registerToAuthManager(auth) {
      auth.addRoute(this);
    }
  }, {
    key: 'roles',
    get: function get() {
      return this.authRoles || [];
    }
  }, {
    key: 'method',
    get: function get() {
      return this.authMethod;
    }
  }]);

  return RouteKlass;
}(Node);

var RouteManagerKlass = function (_Node2) {
  _inherits(RouteManagerKlass, _Node2);

  function RouteManagerKlass() {
    var routes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var name = _ref.name;
    var auth = _ref.auth;

    _classCallCheck(this, RouteManagerKlass);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(RouteManagerKlass).call(this));

    if (auth) _this2.auth = auth;
    if (name) _this2.name = name;
    _this2._hroutes = {};
    routes.forEach(function (route) {
      return _this2.addRoute(route);
    });
    if (_this2.auth) _this2.registerToAuthManager(_this2.auth);
    return _this2;
  }

  _createClass(RouteManagerKlass, [{
    key: 'registerToAuthManager',
    value: function registerToAuthManager(auth) {
      auth.addRouteManager(this);
      _lodash2.default.each(this._hroutes, function (route) {
        return route.registerToAuthManager(auth);
      });
    }
  }, {
    key: 'addRoute',
    value: function addRoute(route) {
      route._rparent = this;
      this._hroutes[route.name] = route;
      Object.defineProperty(this, route.name, {
        get: function get() {
          return route;
        }
      });
    }
  }, {
    key: 'getNode',
    value: function getNode() {
      var path = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

      if (!path) return this;
      var nodes = _lodash2.default.compact(path.split('.'));
      var node = this._hroutes[nodes[0]];
      if (!node) return;
      if (nodes.length === 1) return node;
      return node.getNode(nodes.splice(1).join('.'));
    }
  }, {
    key: 'getRoute',
    value: function getRoute(fullName) {
      return this.root.getNode(fullName);
    }
  }, {
    key: Symbol.iterator,
    value: function value() {
      return this.routes;
    }
  }, {
    key: 'root',
    get: function get() {
      if (this.isRoot()) return this;
      return this._rparent.root;
    }
  }, {
    key: 'routes',
    get: function get() {
      var res = [];
      _lodash2.default.each(this._hroutes, function (r) {
        if (r instanceof RouteManagerKlass) res.push(r.routes);else res.push(r);
      });
      return _lodash2.default.flatten(res);
    }
  }, {
    key: 'defaultRoute',
    get: function get() {
      return _lodash2.default.find(this.routes, function (r) {
        return r.defaultRoute;
      });
    }
  }]);

  return RouteManagerKlass;
}(Node);
