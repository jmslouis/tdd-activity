import 'regenerator-runtime/runtime';

const { validationResult } = require('express-validator');
const postModel = require('../models/post');
const { addPost, getUserPosts, getPost } = require('../controllers/postController'); 

// Mocking express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

// Mocking the post model
jest.mock('../models/post', () => ({
  create: jest.fn(),
  getByUser: jest.fn(),
  getById: jest.fn(),
}));

// Mocking connect-flash
jest.mock('connect-flash', () => jest.fn());

describe('addPost function', () => {
  beforeEach(() => {
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

      const posts = [
        { toObject: jest.fn(() => (mockPosts[0])) },
        { toObject: jest.fn(() => (mockPosts[1])) },
      ];
      
      callback(null, posts);
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

  it('should handle an error during user post retrieval', (done) => {
    // Mocking an invalid user
    const user = 'nonexistentUser';

    // Mocking postModel.getByUser to simulate an error during user post retrieval
    postModel.getByUser.mockImplementation((user, callback) => {
      callback(null, []); 
    });

    // Calling the getUserPosts function
    getUserPosts(user, (postObjects) => {
      // Assertions
      expect(postModel.getByUser).toHaveBeenCalledWith(user, expect.any(Function));
      expect(postObjects).toEqual([]); 
      done(); 
    });
  });

  describe('getPost function', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    
  
    it('should retrieve a post by its ID', (done) => {
      // Mocking a post ID
      const postId = 'mockedPostId';
  
      // Mocking postModel.getPostById to simulate successful post retrieval
      postModel.getById.mockImplementation((id, callback) => {
        // Mocking a post object for the given ID
        const mockPost = { 
          id: postId,
          title: 'Test post', 
          content: 'Test content', 
          toObject: jest.fn(() => ({ })) 
        };


        callback(null, mockPost);
      });
      
      // Mocking render function of res
      const renderMock = jest.fn();

      // Creating a mock response object
      const res = {
        render: renderMock,
      };

      // Mocking req object with params
      const req = {
        params: { id: postId },
      };

      // Calling the getPost function
      getPost(req, res);

      // Assertions
      expect(postModel.getById).toHaveBeenCalledWith(postId, expect.any(Function));
      expect(renderMock).toHaveBeenCalledWith('singlepost', { pageTitle: 'Test post', post: expect.objectContaining({ /* Mocked post object */ }) });

      done();
    });
    
    it('should handle an error during post retrieval and redirect to /posts', async () => {
      // Mocking an invalid post ID
      const postId = 'invalidPostId';
  
      // Mocking postModel.getById to simulate an error during post retrieval
      postModel.getById.mockImplementation((postId, callback) => {
        callback(new Error('Post not found'), null);
      });
  
      // Mocking redirect function of res
      const redirectMock = jest.fn();
  
      // Creating a mock response object
      const res = {
        redirect: redirectMock,
      };
  
      // Mocking req object with params
      const req = {
        params: { id: postId },
      };
  
      // Calling the getPost function
      await getPost(req, res);
  
      // Assertions
      expect(postModel.getById).toHaveBeenCalledWith(postId, expect.any(Function));
      expect(redirectMock).toHaveBeenCalledWith('/posts');
    });
  });
});
