import {Route, RouteManager, Auth, AuthManager} from '../index';
import should from 'should';
import _ from 'lodash';

const personAuthManager = AuthManager([
  Auth({
    name: 'delete',
    roles: ['admin'],
  }),
], 'person');

const authManager = AuthManager([
  personAuthManager,
]);

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
], 'person');

const routes = RouteManager([
  personRoutes,
  Route({
    name: 'notfound',
    path: '/notfound',
    component: 'NotFound',
  }),
], {auth: authManager});


describe('routes', function(){
  it('should be loaded correctly', () => {
  });
});
