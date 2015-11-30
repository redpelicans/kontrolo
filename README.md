# kontrolo [![Build Status](https://travis-ci.org/redpelicans/kontrolo.png)](https://travis-ci.org/redpelicans/kontrolo)
Authorization and route manager helper

Kontrolo was craft to be used with flux, but it's a general wrapper of routes and authorizations used in the context of the [timetrack's](https://github.com/redpelicans/timetrack) project.

Timetrack uses `react-router` and has to protect routes and actions depending on user rights. Kontrolo try to offer a simple way of defining authorizations on actions and routes.

Let's practice, we have to manage persons, `edit`, `delete` and `list` them.
`edit` and `list` are two Kontrolo routes (they will be mapped to react-router routes) whereas `delete` is a Kontrolo action.

To `edit` logged user needs an `admin` role to `delete` it needs an admin role aged more than 18, and to `list` persons we just need an authenticate user. 

Kontrolo needs a flux store that can anwer to `getUser()`, `isLoggedIn()` and `getUserRoles()`

let's simulate our store:

```
const user = { name: 'toto', age: 13, roles: ['admin']};
const loginStore = {
  getUser(){ return user },
  isLoggedIn(){ return !!this.getUser() },
  getUserRoles(){ return user.roles },
}
```

let's define authorizations:

```
import {Route, RouteManager, Auth, AuthManager} from 'kontrolo';

const personAuthManager = AuthManager([
  Auth({
    name: 'delete',
    roles: ['admin'],
    method: function(user){return user.age > 18},
  }),
], {name: 'person'});

const auths = AuthManager([
  personAuthManager,
], {loginStore: loginStore});

```

let's define routes:

```
const personRoutes = RouteManager([
  Route({
    name: 'list',
    path: '/people',
    topic:'people',
    label: 'People', 
    component: PersonListApp,
    isMenu: true,
    iconName: 'users',
    authRequired: true
  }),

  Route({
    name: 'edit',
    path: '/person/edit',
    topic:'people',
    label: 'People', 
    component: PersonEditApp,
    isMenu: true,
    iconName: 'users',
    authRoles: ['admin'],
  })
], {name: 'person'});


const routes = RouteManager([
  personRoutes,
  Route({
    name: 'notfound',
    path: '/notfound',
    component: 'NotFound',
  }),
], {auth: auths});

```

Now inside our react components, we can check if an action or a route is authorized:


```
import auths from './auths';

if(auths.person.isAuthorized('edit')) ....
//or 
if(auths.isAuthorized('person.edit')) ....
```

We can see Kontrolo in action within timetrack:

* within React components, like code above
* in `onEnter` callbacks of `react-router` with a code like this:
```
function onEnter(route, nextState, replaceState){
  if(route.isAuthRequired() && !loginStore.isLoggedIn()) return replaceState({nextRouteName: this.name}, auths.login.path);   if(!auths.isAuthorized(route)) return replaceState(null, auths.unauthorized.path); 
}
* in the react boot file, to transform Kontrolo routes in react-router routes

```

## Install

```
  $ npm install
  $ npm run build
  $ npm test
```
