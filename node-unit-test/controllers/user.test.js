import 'regenerator-runtime/runtime';

const bcrypt = require('bcrypt');

// Mocking the user model
jest.mock('../models/user', () => ({
  getOne: jest.fn(),
  create: jest.fn(),
}));

const userModel = require('../models/user');
const { registerUser, loginUser } = require('./userController');

describe('registerUser function', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should register a new user and redirect to /login on success', async () => {
    // Mocking a valid request
    const req = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
      flash: jest.fn(),
    };

    // Mocking validation to return no errors
    const validationResult = { isEmpty: () => true };

    // Mocking bcrypt.hash to simulate successful password hashing
    bcrypt.hash = jest.fn().mockImplementation((password, saltRounds, callback) => {
      callback(null, 'hashedPassword123');
    });

    // Mocking userModel.getOne to simulate no existing user
    userModel.getOne.mockImplementation((query, callback) => {
      callback(null, null);
    });

    // Mocking userModel.create to simulate successful user creation
    userModel.create.mockImplementation((user, callback) => {
      callback(null, { /* Mocked user object */ });
    });

    // Mocking the session object
    const sessionObject = {};
    req.session = sessionObject;

    // Mocking the res object with a redirect function
    const redirectMock = jest.fn();
    const res = {
      redirect: redirectMock,
    };

    // Calling the registerUser function
    await registerUser(req, res);

    // Assertions
    expect(userModel.getOne).toHaveBeenCalledWith({ email: 'test@example.com' }, expect.any(Function));
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10, expect.any(Function));
    expect(userModel.create).toHaveBeenCalledWith(
      { name: 'Test User', email: 'test@example.com', password: 'hashedPassword123' },
      expect.any(Function)
    );
    expect(req.flash).toHaveBeenCalledWith('success_msg', 'You are now registered! Login below.');
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });

  it('should handle registering an existing user and redirect to /login', async () => {
    // Mocking a valid request
    const req = {
      body: {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      },
      flash: jest.fn(),
    };
  
    // Mocking validation to return no errors
    const validationResult = { isEmpty: () => true };
  
    // Mocking bcrypt.hash to simulate successful password hashing
    bcrypt.hash = jest.fn().mockImplementation((password, saltRounds, callback) => {
      callback(null, 'hashedPassword123');
    });
  
    // Mocking userModel.getOne to simulate an existing user
    userModel.getOne.mockImplementation((query, callback) => {
      callback(null, { /* Mocked existing user object */ });
    });
  
    // Mocking the session object
    const sessionObject = {};
    req.session = sessionObject;
  
    // Mocking the res object with a redirect function
    const redirectMock = jest.fn();
    const res = {
      redirect: redirectMock,
    };
  
    // Calling the registerUser function
    await registerUser(req, res);
  
    // Assertions
    expect(userModel.getOne).toHaveBeenCalledWith({ email: 'existing@example.com' }, expect.any(Function));
    expect(bcrypt.hash).not.toHaveBeenCalled(); // Ensure hash function is not called for existing user
    expect(userModel.create).not.toHaveBeenCalled(); // Ensure create function is not called for existing user
    expect(req.flash).toHaveBeenCalledWith('error_msg', 'User already exists. Please login.');
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });
  
  it('should handle invalid user registration and redirect to /register with error messages', async () => {
    // Mocking a request with invalid user registration data
    const req = {
      body: {
        name: '', // Empty name
        email: 'invalidEmail', // Invalid email format
        password: 'short', // Short password
      },
      flash: jest.fn(),
    };

    // Mocking validation to return errors
    const validationResult = {
      isEmpty: () => false,
      array: () => [{ msg: 'Name is required.' }, { msg: 'Invalid email.' }, { msg: 'Password must be at least 6 characters.' }],
    };

    // Mocking the res object with a redirect function
    const redirectMock = jest.fn();
    const res = {
      redirect: redirectMock,
    };

    // Calling the registerUser function
    await registerUser(req, res);

    // Assertions
    expect(userModel.getOne).not.toHaveBeenCalled();
    expect(userModel.create).not.toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('error_msg', 'Name is required. Invalid email. Password must be at least 6 characters.');
    expect(redirectMock).toHaveBeenCalledWith('/register');
  });
});

describe('loginUser function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log in a user and redirect to /home on success', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
      session: {},
      flash: jest.fn(),
    };

    // Mocking bcrypt.compare to simulate successful password comparison
    bcrypt.compare = jest.fn().mockImplementation((password, hashedPassword, callback) => {
      callback(null, true); // Passwords match
    });

    // Mocking userModel.getOne to simulate an existing user
    userModel.getOne.mockImplementation((query, callback) => {
      callback(null, { _id: 'userId123', name: 'Test User', email: 'test@example.com', password: 'hashedPassword123' });
    });

    // Mocking res object with redirect function
    const redirectMock = jest.fn();
    const res = {
      redirect: redirectMock,
    };

    // Calling the loginUser function
    await loginUser(req, res);

    // Assertions
    expect(userModel.getOne).toHaveBeenCalledWith({ email: 'test@example.com' }, expect.any(Function));
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123', expect.any(Function));
    expect(req.session.user).toBe('userId123');
    expect(req.session.name).toBe('Test User');
    expect(redirectMock).toHaveBeenCalledWith('/');
  });

  it('should redirect to /login with error message when an existing user enters incorrect password', async () => {
    // Mocking a request with valid user login data
    const req = {
      body: {
        email: 'test@example.com',
        password: 'wrongpassword', // Incorrect password
      },
      flash: jest.fn(),
      session: {},
    };

    // Mocking bcrypt.compare to simulate unsuccessful password comparison
    bcrypt.compare = jest.fn().mockImplementation((password, hashedPassword, callback) => {
      callback(null, false); // Passwords do not match
    });

    // Mocking userModel.getOne to simulate an existing user
    userModel.getOne.mockImplementation((query, callback) => {
      callback(null, { _id: 'userId123', name: 'Test User', email: 'test@example.com', password: 'hashedPassword123' });
    });

    // Mocking res object with redirect function
    const redirectMock = jest.fn();
    const res = {
      redirect: redirectMock,
    };

    // Calling the loginUser function
    await loginUser(req, res);

    // Assertions
    expect(userModel.getOne).toHaveBeenCalledWith({ email: 'test@example.com' }, expect.any(Function));
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword123', expect.any(Function));
    expect(req.session.user).toBeUndefined();
    expect(req.session.name).toBeUndefined();
    expect(req.flash).toHaveBeenCalledWith('error_msg', 'Incorrect password. Please try again.');
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });
});