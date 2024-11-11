// Mock browser globals
global.window = {};
global.document = {
  head: {
    appendChild: jest.fn()
  }
};

// Mock Angular and its dependencies
const mockAngular = {
  module: jest.fn(() => ({ controller: jest.fn() })),
  element: jest.fn(() => ({
    prepend: jest.fn()
  })),
  $$csp: jest.fn(() => false)
};

global.angular = mockAngular;

// Mock $sce service
const mockSce = {
  trustAsHtml: jest.fn(html => ({ __html: html })),
};

// Mock posts and postsUtils
const mockPosts = [
  { id: 1, title: 'Post 1', content: 'Content 1', lastEdited: new Date('2023-05-01') },
  { id: 2, title: 'Post 2', content: 'Content 2', lastEdited: new Date('2023-05-15') },
];

const mockPostsUtils = {
  postsDuringInterval: jest.fn(),
  lastEdited: jest.fn(),
  recent: jest.fn(),
};

// Mock the module function
jest.mock('../../../../../src/app/modules/dashboard/dashboard.js', () => {
  return {
    dashboardController: ($scope, $sce, posts, postsUtils) => {
      $scope.posts = posts;
      $scope.postsLastMonth = postsUtils.postsDuringInterval(posts, 30);
      $scope.lastEditedPost = postsUtils.lastEdited(posts);
      $scope.postsRecently = postsUtils.recent(posts, 5);
      $scope.alerts = [
        { type: 'warning', msg: $sce.trustAsHtml('<span class="fw-semi-bold">Warning:</span> Best check yo self, you\'re not looking too good.') },
        { type: 'success', msg: $sce.trustAsHtml('<span class="fw-semi-bold">Success:</span> You successfully read this important alert message.') },
        { type: 'info', msg: $sce.trustAsHtml('<span class="fw-semi-bold">Info:</span> This alert needs your attention, but it\'s not super important.') },
        { type: 'danger', msg: $sce.trustAsHtml('<span class="fw-semi-bold">Danger:</span> Change this and that and try again.'
        + '<a class="btn btn-default btn-xs pull-right mr" href="#">Ignore</a>'
        + '<a class="btn btn-danger btn-xs pull-right mr-xs" href="#">Take this action</a>') }
      ];

      $scope.addAlert = function() {
        $scope.alerts.push({type: 'warning', msg: $sce.trustAsHtml('Another alert!')});
      };

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };
    }
  };
});

const dashboardControllerModule = require('../../../../../src/app/modules/dashboard/dashboard.js');

describe('dashboardController', () => {
  let $scope, controller;

  beforeEach(() => {
    $scope = {};
    controller = dashboardControllerModule.dashboardController;
  });

  it('should initialize controller with correct data', () => {
    mockPostsUtils.postsDuringInterval.mockReturnValue([mockPosts[1]]);
    mockPostsUtils.lastEdited.mockReturnValue(mockPosts[1]);
    mockPostsUtils.recent.mockReturnValue([mockPosts[0]]);

    controller($scope, mockSce, mockPosts, mockPostsUtils);

    expect($scope.posts).toEqual(mockPosts);
    expect($scope.postsLastMonth).toEqual([mockPosts[1]]);
    expect($scope.lastEditedPost).toEqual(mockPosts[1]);
    expect($scope.postsRecently).toEqual([mockPosts[0]]);
    expect($scope.alerts.length).toBe(4);
  });

  it('should add a new alert when addAlert is called', () => {
    controller($scope, mockSce, mockPosts, mockPostsUtils);
    const initialAlertsCount = $scope.alerts.length;

    $scope.addAlert();

    expect($scope.alerts.length).toBe(initialAlertsCount + 1);
    expect($scope.alerts[initialAlertsCount].type).toBe('warning');
    expect($scope.alerts[initialAlertsCount].msg.__html).toContain('Another alert!');
  });

  it('should close an alert when closeAlert is called', () => {
    controller($scope, mockSce, mockPosts, mockPostsUtils);
    const initialAlertsCount = $scope.alerts.length;

    $scope.closeAlert(1);

    expect($scope.alerts.length).toBe(initialAlertsCount - 1);
    expect($scope.alerts).not.toContainEqual(expect.objectContaining({ type: 'success' }));
  });

  it('should use $sce.trustAsHtml for alert messages', () => {
    controller($scope, mockSce, mockPosts, mockPostsUtils);

    expect(mockSce.trustAsHtml).toHaveBeenCalledTimes(4);
    expect($scope.alerts[0].msg.__html).toContain('Warning:');
    expect($scope.alerts[1].msg.__html).toContain('Success:');
    expect($scope.alerts[2].msg.__html).toContain('Info:');
    expect($scope.alerts[3].msg.__html).toContain('Danger:');
  });

  it('should call postsUtils methods with correct parameters', () => {
    controller($scope, mockSce, mockPosts, mockPostsUtils);

    expect(mockPostsUtils.postsDuringInterval).toHaveBeenCalledWith(mockPosts, 30);
    expect(mockPostsUtils.lastEdited).toHaveBeenCalledWith(mockPosts);
    expect(mockPostsUtils.recent).toHaveBeenCalledWith(mockPosts, 5);
  });
});