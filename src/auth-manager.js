import _ from 'lodash';

export function Auth(...elt){
  return new AuthKlass(...elt);
}

export function AuthManager(auths, name){
  return new AuthManagerKlass(auths, name);
}

class AuthKlass{
  constructor({name, required, roles=[], method}={}){
    this.name = name;
    this.required = required;
    this.method = method;
    this.roles = _.isArray(roles) ? roles : [roles];
  }

  isAuthRequired(){
    return this.roles && this.roles.length || this.method || this.required;
  }
}

class AuthManagerKlass{
  constructor(auths=[], {name, loginStore}={}){
    if(name) this.name = name;
    if(loginStore) this._loginStore = loginStore;
    this._hauths = {};
    auths.forEach(auth => this.addAuth(auth) );
  }

  addAuth(auth){
    if(!auth.name) throw new Error('Cannot register an auth or route without a name!');
    auth._aparent = this;
    this._hauths[auth.name] = auth;
    Object.defineProperty(this, auth.name, {
      get: function(){ return auth },
    });
  }

  getNode(path=""){
    if(!path) return this;
    const nodes = _.compact(path.split('.'));
    const node = this._hauths[nodes[0]];
    if(!node) return;
    if(nodes.length === 1) return node;
    return node.getNode(nodes.splice(1).join('.'));
  }

  getParentNode(path=""){
    const nodes = _.compact(path.split('.'));
    const name = nodes.pop();
    return [this.getNode(nodes.join('.')), name];
  }

  addRoute(route){
    const path = route.fullName;
    const [parent, name] = this.getParentNode(path);
    if(!parent) throw new Error("Cannot add route: " + path);
    parent.addAuth(route);
  }

  addRouteManager(route){
    const path = route.fullName;
    const node = this.getNode(path);
    if(!node && path){
      const [parent, name] = this.getParentNode(path);
      parent.addAuth(new AuthManagerKlass([], {name}));
    }
  }

  registerRouteManager(routeManager){
    routeManager.registerToAuthManager(this)
    return this
  }

  get auths(){
    return _.values(this._hauths);
  }

  isRoot(){
    return !this._aparent;
  }

  get root(){
    if(this.isRoot()) return this;
    return this._aparent.root;
  }

  get loginStore(){
    if(this._loginStore) return this._loginStore;
    if(this.isRoot()) throw new Error("Cannot find any loginStore associated to authManager");
    return this._aparent._loginStore;
  }

  isAuthorized(authOrRoute, context){
    let auth;
    if(_.isString(authOrRoute)) auth = this.getNode(authOrRoute);
    else auth = this.root.getNode(authOrRoute.fullName);

    if(!auth) return true;
    if(!auth.isAuthRequired()) return true;
    if(!this.loginStore.isLoggedIn()) return false;
    const roles = this.loginStore.getUserRoles();
    return chechAuthRoles(auth, roles) && chechAuthMethod(auth, this.loginStore.getUser(), context);
  }

  [Symbol.iterator](){
    return this.auths;
  }
}

function chechAuthMethod(auth, user, context){
  if(!auth.method) return true;
  return auth.method(user, context);
}

function chechAuthRoles(auth, roles){
  if(!auth.roles || !auth.roles.length) return true;
  return hasRoles(roles, 'admin') || hasRoles(roles, auth.roles);
}

function hasRoles(roles, requiredRoles){
  return !!_.intersection(_.flatten([roles]), _.flatten([requiredRoles])).length;
}


