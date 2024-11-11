// posts.test.js

// Mock Angular
global.angular = {
  module: jest.fn().mockReturnThis(),
  factory: jest.fn().mockReturnThis()
};

// Mock $resource
const mockResource = jest.fn().mockReturnValue({
  update: jest.fn()
});

// Import the file we want to test
require('../../../../../src/app/modules/data/posts');

// Extract the postsUtils factory function
const postsUtilsFactory = global.angular.factory.mock.calls.find(call => call[0] === 'postsUtils')[1];
const postsUtils = postsUtilsFactory(mockResource);

describe('postsUtils', () => {
  describe('postsDuringInterval', () => {
    it('should return posts within the specified interval', () => {
      const today = new Date();
      const posts = [
        { date: today.toISOString() },
        { date: new Date(today.getTime() - 86400000).toISOString() },
        { date: new Date(today.getTime() - 172800000).toISOString() },
      ];

      const result = postsUtils.postsDuringInterval(posts, 2);
      expect(result.length).toBe(2);
      expect(result).toContain(posts[0]);
      expect(result).toContain(posts[1]);
    });

    it('should return an empty array if no posts are within the interval', () => {
      const today = new Date();
      const posts = [
        { date: new Date(today.getTime() - 345600000).toISOString() }, // 4 days ago
      ];

      const result = postsUtils.postsDuringInterval(posts, 3);
      expect(result).toEqual([]);
    });
  });

  describe('recent', () => {
    it('should return the most recent post when no count is specified', () => {
      const posts = [
        { date: '2023-05-01' },
        { date: '2023-05-03' },
        { date: '2023-05-02' },
      ];

      const result = postsUtils.recent(posts);
      expect(result.length).toBe(1);
      expect(result[0].date).toBe('2023-05-03');
    });

    it('should return the specified number of most recent posts', () => {
      const posts = [
        { date: '2023-05-01' },
        { date: '2023-05-03' },
        { date: '2023-05-02' },
        { date: '2023-05-04' },
      ];

      const result = postsUtils.recent(posts, 2);
      expect(result.length).toBe(2);
      expect(result[0].date).toBe('2023-05-04');
      expect(result[1].date).toBe('2023-05-03');
    });
  });

  describe('lastEdited', () => {
    it('should return the most recently edited post', () => {
      const posts = [
        { date: '2023-05-01' },
        { date: '2023-05-03' },
        { date: '2023-05-02' },
      ];

      const result = postsUtils.lastEdited(posts);
      expect(result.date).toBe('2023-05-03');
    });

    it('should return the first post if all posts have the same date', () => {
      const posts = [
        { date: '2023-05-01', id: 1 },
        { date: '2023-05-01', id: 2 },
        { date: '2023-05-01', id: 3 },
      ];

      const result = postsUtils.lastEdited(posts);
      expect(result).toEqual(posts[0]);
    });
  });
});