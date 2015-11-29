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
  constructor(auths=[], name){
    this.name = name;
    this._hauths = {};
    auths.forEach(auth => {
      this.addAuth(auth);
    });
  }

  addAuth(auth){
    this._hauths[auth.name] = auth;
    Object.defineProperty(this, auth.name, {
      get: function(){ return auth },
    });
  }

  getNode(path){
  }

  addRoute(route){
    this.addAuth(route);
  }

  addRouteManager(route){
    const path = route.treeName;
    //const node = getNode(_.compact(path.split('/'))) ........
  }

  get auths(){
    return _.values(this._hauths);
  }

  isAuthorized(authOrRouteName){
    const auth = this.auths[authOrRouteName];
    if(!auth) return true;
    if(!auth.isAuthRequired()) return true;
    if(!loginStore.isLoggedIn()) return false;
    const roles = loginStore.getRoles();

    return hasRoles(roles, 'admin') || hasRoles(roles, auth.roles);
    //return hasRoles(roles, auth.roles);
  }

  [Symbol.iterator](){
    return this.auths;
  }
}

function hasRoles(roles, requiredRoles){
  return _.intersection(_.flatten([roles]), _.flatten([requiredRoles])).length;
}


