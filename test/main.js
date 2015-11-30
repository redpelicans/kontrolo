import {Route, RouteManager, Auth, AuthManager} from '../index';
import should from 'should';
import _ from 'lodash';

const user = { name: 'toto', age: 13, roles: ['role1']};

const loginStore = {
  getUser(){ return user },
  isLoggedIn(){ return !!this.getUser() },
  getUserRoles(){ return user.roles },
}

const personAuthManager = AuthManager([
  Auth({
    name: 'delete',
    roles: ['role1'],
  }),
  Auth({
    name: 'edit',
    roles: ['role2'],
    method: function(user){return user.age > 18},
  }),
], {name: 'person'});


const auths = AuthManager([
  personAuthManager,
], {loginStore: loginStore});


const companyRoutes = RouteManager([
  Route({
    name: 'list',
    path: '/companies',
    topic:'companies',
    label: 'Company', 
    authRoles: ['role4']
  }),
], {name: 'company'});


const personRoutes = RouteManager([
  Route({
    name: 'list',
    path: '/people',
    topic:'people',
    label: 'People', 
    component: 'PersonListApp',
    isMenu: true,
    iconName: 'users',
    authRequired: true
  }),
  Route({
    name: 'promote',
    path: '/person/promote',
    topic:'people',
    label: 'People', 
    component: 'PersonListApp',
    isMenu: true,
    iconName: 'users',
    authRoles: ['role3'],
    authMethod: function(user){return user.age > 18},
  }),

], {name: 'person'});


const routes = RouteManager([
  personRoutes,
  companyRoutes,
  Route({
    name: 'notfound',
    path: '/notfound',
    component: 'NotFound',
  }),
], {auth: auths});


describe('route', function(){

  it('should get notfound', () => {
    should(routes.notfound.path).equal('/notfound');
    should(routes.notfound.name).equal('notfound');
    should(routes.notfound.component).equal('NotFound');
    should(routes.notfound.fullName).equal('notfound');
  });

  it('should get person', () => {
    should(routes.person.list.path).equal('/people');

    should(routes.getRoute(routes.person.list.fullName).path).equal('/people');
    should(routes.person.getRoute(routes.person.list.fullName).path).equal('/people');

    should(routes.person.list.name).equal('list');
    should(routes.person.list.component).equal('PersonListApp');
    should(routes.person.list.fullName).equal('person.list');
    should(auths.person.isAuthorized('promote')).equal(false);
    should(auths.isAuthorized(routes.person.promote)).equal(false);
    should(auths.person.isAuthorized(routes.person.promote)).equal(false);
  });

  it('should get company', () => {
    should(routes.company.list.path).equal('/companies');
    should(routes.company.fullName).equal('company');
    should(auths.company.isAuthorized('list')).equal(false);
    should(auths.isAuthorized('company.list')).equal(false);
  });

});

describe('auth', function(){
  it('should get person', () => {
    should(auths.person.delete.name).equal('delete');
  });

  it('should get company', () => {
    should(auths.company.list.path).equal('/companies');
  });

  it('should be authorized', () => {
    should(auths.person.isAuthorized('delete')).equal(true);
    should(auths.isAuthorized('person.delete')).equal(true);
  });

  it('should not be authorized', () => {
    should(auths.person.isAuthorized('edit')).equal(false);
  });

  it('should check method', () => {
    should(auths.person.isAuthorized('edit')).equal(false);
    user.roles = ['role2'];
    should(auths.person.isAuthorized('edit')).equal(false);
    user.age = 19;
    should(auths.person.isAuthorized('edit')).equal(true);
    user.roles = ['role2', 'role3'];
    should(auths.person.isAuthorized('promote')).equal(true);
    user.age = 9;
    should(auths.isAuthorized('person.promote')).equal(false);
  });

});
