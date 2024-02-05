import 'regenerator-runtime/runtime';

const { validationResult } = require('express-validator');
const postModel = require('../models/post');
const { addPost } = require('./postController'); // Replace with the correct file path
const { getUserPosts } = require('./postController'); // Replace with the correct file path

// Mocking express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

// Mocking the post model
jest.mock('../models/post', () => ({
  create: jest.fn(),
  getByUser: jest.fn(),
}));

// Mocking connect-flash
jest.mock('connect-flash', () => jest.fn());

describe('addPost function', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should handle a valid post creation', async () => {
    // Mocking a valid request
    const req = {
      body: {
        title: 'Test Title',
        content: 'Test Content',
      },
      session: {
        user: 'testUser',
      },
      flash: jest.fn(),
    };

    const res = {
      redirect: jest.fn(),
    };

    const next = jest.fn();

    // Mocking validation to return no errors
    validationResult.mockReturnValue({ isEmpty: () => true });

    // Mocking postModel.create to simulate successful post creation
    postModel.create.mockImplementation((post, callback) => {
      callback(null, { /* Mocked post object */ });
    });

    // Calling the addPost function
    await addPost(req, res, next);

    // Assertions
    expect(validationResult).toHaveBeenCalledWith(req);
    expect(postModel.create).toHaveBeenCalledWith(
      {
        title: 'Test Title',
        content: 'Test Content',
        author: 'testUser',
      },
      expect.any(Function)
    );
    expect(res.redirect).toHaveBeenCalledWith('/posts');
  });

  it('should handle invalid post creation and redirect to /posts/add', async () => {
    // Mocking an invalid request
    const req = {
      body: {
        title: '', // Intentionally making the title empty to trigger validation error
        content: 'Test Content',
      },
      session: {
        user: 'testUser',
      },
      flash: jest.fn(),
    };

    const res = {
      redirect: jest.fn(),
    };

    const next = jest.fn();

    // Mocking validation to return errors
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Title is required.' }],
    });

    // Calling the addPost function
    await addPost(req, res, next);

    // Assertions
    expect(validationResult).toHaveBeenCalledWith(req);
    expect(postModel.create).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/posts/add');
  });
});

describe('getUserPosts function', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should handle successful retrieval of user posts', () => {
    // Mocking a valid user
    const user = 'testUser';

    // Mocking postModel.getByUser to simulate successful post retrieval
    postModel.getByUser.mockImplementation((user, callback) => {
      const mockPosts = [
        { 
          title: 'Test Post 1', 
          content: 'Test Content 2' 
        },
        { 
          title: 'Test Post 1', 
          content: 'Test Content 2' 
        },
      ];
      callback(null, mockPosts);
    });

    // Mocking the callback function
    const callbackMock = jest.fn();

    // Calling the getUserPosts function
    getUserPosts(user, callbackMock);

    // Assertions
    expect(postModel.getByUser).toHaveBeenCalledWith(user, expect.any(Function));
    expect(callbackMock).toHaveBeenCalledWith([
      { 
        title: 'Test Post 1', 
        content: 'Test Content 2' 
      },
      { 
        title: 'Test Post 1', 
        content: 'Test Content 2' 
      },
    ]);
  });
});