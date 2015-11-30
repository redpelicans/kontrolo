'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Auth = Auth;
exports.AuthManager = AuthManager;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function Auth() {
  for (var _len = arguments.length, elt = Array(_len), _key = 0; _key < _len; _key++) {
    elt[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(AuthKlass, [null].concat(elt)))();
}

function AuthManager(auths, name) {
  return new AuthManagerKlass(auths, name);
}

var AuthKlass = (function () {
  function AuthKlass() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var name = _ref.name;
    var required = _ref.required;
    var _ref$roles = _ref.roles;
    var roles = _ref$roles === undefined ? [] : _ref$roles;
    var method = _ref.method;

    _classCallCheck(this, AuthKlass);

    this.name = name;
    this.required = required;
    this.method = method;
    this.roles = _lodash2.default.isArray(roles) ? roles : [roles];
  }

  _createClass(AuthKlass, [{
    key: 'isAuthRequired',
    value: function isAuthRequired() {
      return this.roles && this.roles.length || this.method || this.required;
    }
  }]);

  return AuthKlass;
})();

var AuthManagerKlass = (function () {
  function AuthManagerKlass() {
    var _this = this;

    var auths = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var name = _ref2.name;
    var loginStore = _ref2.loginStore;

    _classCallCheck(this, AuthManagerKlass);

    if (name) this.name = name;
    if (loginStore) this._loginStore = loginStore;
    this._hauths = {};
    auths.forEach(function (auth) {
      return _this.addAuth(auth);
    });
  }

  _createClass(AuthManagerKlass, [{
    key: 'addAuth',
    value: function addAuth(auth) {
      auth._aparent = this;
      this._hauths[auth.name] = auth;
      Object.defineProperty(this, auth.name, {
        get: function get() {
          return auth;
        }
      });
    }
  }, {
    key: 'getNode',
    value: function getNode() {
      var path = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

      if (!path) return this;
      var nodes = _lodash2.default.compact(path.split('.'));
      var node = this._hauths[nodes[0]];
      if (!node) return;
      if (nodes.length === 1) return node;
      return node.getNode(nodes.splice(1).join('.'));
    }
  }, {
    key: 'getParentNode',
    value: function getParentNode() {
      var path = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

      var nodes = _lodash2.default.compact(path.split('.'));
      var name = nodes.pop();
      return [this.getNode(nodes.join('.')), name];
    }
  }, {
    key: 'addRoute',
    value: function addRoute(route) {
      var path = route.treeName;

      var _getParentNode = this.getParentNode(path);

      var _getParentNode2 = _slicedToArray(_getParentNode, 2);

      var parent = _getParentNode2[0];
      var name = _getParentNode2[1];

      if (!parent) throw new Error("Cannot add route: " + path);
      parent.addAuth(route);
    }
  }, {
    key: 'addRouteManager',
    value: function addRouteManager(route) {
      var path = route.treeName;
      var node = this.getNode(path);
      if (!node && path) {
        var _getParentNode3 = this.getParentNode(path);

        var _getParentNode4 = _slicedToArray(_getParentNode3, 2);

        var parent = _getParentNode4[0];
        var name = _getParentNode4[1];

        parent.addAuth(new AuthManagerKlass([], { name: name }));
      }
    }
  }, {
    key: 'isRoot',
    value: function isRoot() {
      return !this._aparent;
    }
  }, {
    key: 'isAuthorized',
    value: function isAuthorized(authOrRoute) {
      var auth = undefined;
      if (_lodash2.default.isString(authOrRoute)) auth = this.getNode(authOrRoute);else auth = this.root.getNode(authOrRoute.treeName);

      if (!auth) return true;
      if (!auth.isAuthRequired()) return true;
      if (!this.loginStore.isLoggedIn()) return false;
      var roles = this.loginStore.getUserRoles();
      return chechAuthRoles(auth, roles) && chechAuthMethod(auth, this.loginStore.getUser());
    }
  }, {
    key: Symbol.iterator,
    value: function value() {
      return this.auths;
    }
  }, {
    key: 'auths',
    get: function get() {
      return _lodash2.default.values(this._hauths);
    }
  }, {
    key: 'root',
    get: function get() {
      if (this.isRoot()) return this;
      return this._aparent.root;
    }
  }, {
    key: 'loginStore',
    get: function get() {
      if (this._loginStore) return this._loginStore;
      if (this.isRoot()) throw new Error("Cannot find any loginStore associated to authManager");
      return this._aparent._loginStore;
    }
  }]);

  return AuthManagerKlass;
})();

function chechAuthMethod(auth, user) {
  if (!auth.method) return true;
  return auth.method(user);
}

function chechAuthRoles(auth, roles) {
  if (!auth.roles || !auth.roles.length) return true;
  return hasRoles(roles, 'admin') || hasRoles(roles, auth.roles);
}

function hasRoles(roles, requiredRoles) {
  return !!_lodash2.default.intersection(_lodash2.default.flatten([roles]), _lodash2.default.flatten([requiredRoles])).length;
}
