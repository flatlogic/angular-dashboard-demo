const { requestHelper, hidePassword } = require('../../srv/util');

describe('requestHelper', () => {
  it('should handle successful requests', async () => {
    const mockReq = {};
    const mockRes = {
      send: jest.fn(),
    };
    const mockFunc = jest.fn().mockResolvedValue({ data: 'success' });

    const wrappedFunc = requestHelper(mockFunc);
    await wrappedFunc(mockReq, mockRes);

    expect(mockFunc).toHaveBeenCalledWith(mockReq);
    expect(mockRes.send).toHaveBeenCalledWith({ data: 'success' });
  });

  it('should handle errors with status code', async () => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockError = new Error('Test error');
    mockError.statusCode = 400;
    const mockFunc = jest.fn().mockRejectedValue(mockError);

    const wrappedFunc = requestHelper(mockFunc);
    await wrappedFunc(mockReq, mockRes);

    expect(mockFunc).toHaveBeenCalledWith(mockReq);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'Test error' });
  });

  it('should handle errors without status code', async () => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockError = new Error('Internal server error');
    const mockFunc = jest.fn().mockRejectedValue(mockError);

    const wrappedFunc = requestHelper(mockFunc);
    await wrappedFunc(mockReq, mockRes);

    expect(mockFunc).toHaveBeenCalledWith(mockReq);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

describe('hidePassword', () => {
  it('should remove password from user object', () => {
    const user = {
      id: 1,
      username: 'testuser',
      password: 'secret123',
      email: 'test@example.com'
    };

    const result = hidePassword(user);

    expect(result).toEqual({
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    });
    expect(result).not.toHaveProperty('password');
  });

  it('should handle user object without password', () => {
    const user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    const result = hidePassword(user);

    expect(result).toEqual(user);
  });

  it('should not modify the original user object', () => {
    const user = {
      id: 1,
      username: 'testuser',
      password: 'secret123',
      email: 'test@example.com'
    };

    hidePassword(user);

    expect(user).toEqual({
      id: 1,
      username: 'testuser',
      password: 'secret123',
      email: 'test@example.com'
    });
  });
});