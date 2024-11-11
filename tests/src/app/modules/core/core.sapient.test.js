const angular = require('angular');
require('angular-mocks');

// Mock dependencies
const mockConfig = { appTitle: 'Test App' };
const mockShortHistory = { init: jest.fn() };
const mockAuthorize = { checkAccess: jest.fn() };
const mockSession = {};

// Mock browser globals
global.window = {};
global.document = {
  querySelector: jest.fn()
};
global.$ = jest.fn(() => ({
  toggleClass: jest.fn()
}));

// Import the module containing the controller
require('../../../../../src/app/modules/core/core');

describe('AppController', () => {
  let $controller, $rootScope, $scope, $state, controller;

  beforeEach(() => {
    angular.mock.module('app.core');

    angular.mock.module($provide => {
      $provide.value('config', mockConfig);
      $provide.value('shortHistory', mockShortHistory);
      $provide.value('authorize', mockAuthorize);
      $provide.value('session', mockSession);
    });

    angular.mock.inject((_$controller_, _$rootScope_, _$state_) => {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $state = _$state_;
      $scope = $rootScope.$new();
    });

    controller = $controller('App', {
      $scope: $scope,
      $state: $state,
      $rootScope: $rootScope,
      config: mockConfig,
      shortHistory: mockShortHistory,
      authorize: mockAuthorize,
      session: mockSession
    });
  });

  it('should set the title from config', () => {
    expect(controller.title).toBe(mockConfig.appTitle);
  });

  it('should set app and $state on $scope', () => {
    expect($scope.app).toBe(mockConfig);
    expect($scope.$state).toBe($state);
  });

  it('should call authorize.checkAccess on $stateChangeStart', () => {
    const toState = { name: 'testState' };
    const toParams = { id: 1 };
    $rootScope.$broadcast('$stateChangeStart', toState, toParams);
    expect(mockAuthorize.checkAccess).toHaveBeenCalledWith(expect.any(Object), toState, toParams);
  });

  it('should toggle nav-shown class on $stateChangeSuccess', () => {
    $scope.$broadcast('$stateChangeSuccess');
    expect($('body').toggleClass).toHaveBeenCalledWith('nav-shown', false);
  });

  it('should set currentUser on $userSet event', () => {
    const user = { name: 'Test User' };
    $rootScope.$broadcast('$userSet', user);
    expect(controller.currentUser).toBe(user);
  });

  it('should initialize shortHistory', () => {
    expect(mockShortHistory.init).toHaveBeenCalledWith($scope);
  });

  // Additional test to cover $stateChangeStart with different parameters
  it('should call authorize.checkAccess with correct parameters on $stateChangeStart', () => {
    const toState = { name: 'anotherState' };
    const toParams = { id: 2, extra: 'param' };
    const fromState = { name: 'previousState' };
    const fromParams = { id: 1 };
    $rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams);
    expect(mockAuthorize.checkAccess).toHaveBeenCalledWith(expect.any(Object), toState, toParams);
  });
});