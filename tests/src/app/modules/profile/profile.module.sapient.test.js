// Set up global mock for angular
global.angular = {
  module: jest.fn(() => ({
    config: jest.fn()
  }))
};

// Import the module to be tested
require('../../../../../src/app/modules/profile/profile.module.js');

describe('app.profile module', () => {
  it('should create an Angular module named app.profile', () => {
    expect(global.angular.module).toHaveBeenCalledWith('app.profile', ['ui.router']);
  });

  it('should configure the module with appConfig', () => {
    const mockModule = global.angular.module('app.profile', ['ui.router']);
    expect(mockModule.config).toHaveBeenCalled();
  });

  describe('appConfig', () => {
    let $stateProvider;
    let configFn;

    beforeEach(() => {
      $stateProvider = {
        state: jest.fn().mockReturnThis()
      };
      const mockModule = global.angular.module('app.profile', ['ui.router']);
      configFn = mockModule.config.mock.calls[0][0];
    });

    it('should inject $stateProvider', () => {
      expect(configFn.$inject).toEqual(['$stateProvider']);
    });

    it('should configure the login state', () => {
      configFn($stateProvider);
      expect($stateProvider.state).toHaveBeenCalledWith('login', {
        url: '/login',
        data: {
          noAuth: true
        },
        templateUrl: 'app/modules/profile/auth/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      });
    });

    it('should configure the app.profile state', () => {
      configFn($stateProvider);
      expect($stateProvider.state).toHaveBeenCalledWith('app.profile', {
        url: '/profile',
        templateUrl: 'app/modules/profile/edit/edit.html',
        controller: 'ProfileController',
        controllerAs: 'vm'
      });
    });

    it('should configure both states in the correct order', () => {
      configFn($stateProvider);
      expect($stateProvider.state.mock.calls.length).toBe(2);
      expect($stateProvider.state.mock.calls[0][0]).toBe('login');
      expect($stateProvider.state.mock.calls[1][0]).toBe('app.profile');
    });
  });
});