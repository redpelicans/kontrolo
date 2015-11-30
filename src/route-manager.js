import authMgr from '../lib/auth-manager';
import _ from 'lodash';

export function Route(...elt){
  return new RouteKlass(...elt);
}

export function RouteManager(routes, options){
  return new RouteManagerKlass(routes, options);
}

class Node{
  isRoot(){
    return !this._rparent;
  }

  get treeName(){
    function tn(node){
      if(node.isRoot()) return '';
      return tn(node._rparent) + '.' + node.name;
    }
    return tn(this).slice(1);
  }
}

class RouteKlass extends Node{
  constructor(attrs={}){
    super();
    _.extend(this, _.pick(attrs, 'name', 'path', 'topic', 'defaultRoute', 'label', 'component', 'isMenu', 'iconName', 'authRequired', 'authRoles', 'authMethod'));
  }

  isAuthRequired(){
    return this.authRequired || this.authRoles && this.authRoles.length || this.authMethod;
  }

  get roles(){
    return this.authRoles || [];
  }

  get method(){
    return this.authMethod;
  }

  registerToAuthManager(auth){
    auth.addRoute(this);
  }
}

class RouteManagerKlass extends Node{
  constructor(routes=[], {name, auth}={}){
    super();
    if(auth) this.auth = auth;
    if(name) this.name = name;
    this._hroutes = {};
    routes.forEach(route => this.addRoute(route) );
    if(this.auth) this.registerToAuthManager(this.auth);
  }

  registerToAuthManager(auth){
    auth.addRouteManager(this);
    this.routes.forEach(route => route.registerToAuthManager(auth));
  }

  addRoute(route){
    route._rparent = this;
    this._hroutes[route.name] = route;
    Object.defineProperty(this, route.name, {
      get: function(){ return route },
    });
  }

  get routes(){
    return _.values(this._hroutes);
  }

  get defaultRoute(){
    return _.find(this.routes, r => r.defaultRoute);
  }

  [Symbol.iterator](){
    return this.routes;
  }
}



