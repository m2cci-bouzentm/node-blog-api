require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();


// user input validations
const validateUserSignUp = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('username cannot be empty')
    .isLength({ min: 3, max: 1500 })
    .withMessage('username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('Password must be at least 3 characters long'),
  body('passwordConfirmation')
    .trim()
    .notEmpty()
    .withMessage('Confirm password cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('Confirm password must be at least 3 characters long')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];
const validateUserSettingsChange = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Comment content cannot be empty')
    .isLength({ min: 3, max: 1500 })
    .withMessage('Comment content must be at least 3 characters long'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('Password must be at least 3 characters long'),
  body('passwordConfirmation')
    .trim()
    .notEmpty()
    .withMessage('Confirm password cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('Confirm password must be at least 3 characters long')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  body('avatarUrl'),
];


// Some helper functions 
const isLoggedIn = (res, req, next) => {
  if (req.currentUser === null) {
    return next(new Error('User Not logged In'));
  }

  next();
};

function generateUserToken(user, secretKey) {

}
const userAndTokenAfterChange = async (user) => {
  // send new user info and token to the front
  return new Promise((resolve, reject) => {
    const userWithoutPw = { ...user, password: '' };
    jwt.sign(userWithoutPw, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
      if (err) return reject(err);
      resolve({ userWithoutPw, token });
    });
  });
};

// verify user function to check if user exists in the current database (just like passport verify function) 
const verifyUser = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  if (!user) {
    return { message: 'Incorrect username' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { message: 'Incorrect password' };
  }

  return { user };
};


// handle user sign in, sign up and its status between requests
const handleUserSignIn = asyncHandle(async (req, res, next) => {
  const { username, password } = req.body;
  const verifyUserRes = await verifyUser(username, password);

  // failed attempt to log in
  if (typeof verifyUserRes.message !== 'undefined') {
    return res.json(verifyUserRes);
  }

  const userWithoutPw = { ...verifyUserRes.user, password: '' };
  jwt.sign(userWithoutPw, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
    if (err) return next(err);
    res.json({ user: userWithoutPw, token });
  });
});
const verifyUserLogIn = (req, res, next) => {
  if (req.currentUser === null) {
    next(new Error('User Not logged In'));
  }

  res.json(req.currentUser);
};
const handleUserSignUp = [
  validateUserSignUp,
  asyncHandle(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { username, email, password, authorKey } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: authorKey === process.env.AUTHOR_KEY ? "AUTHOR" : "USER"
      },
    });

    const userWithoutPw = { ...user, password: '' };
    jwt.sign(userWithoutPw, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
      if (err) return next(err);
      res.json({ user: userWithoutPw, token });
    });
  }),
];


// controllers to update user information 
const handleUsernameChange = [
  isLoggedIn,
  validateUserSettingsChange[0],
  async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { id, username } = req.body;
    let user;
    try {
      user = await prisma.user.update({
        where: {
          id
        },
        data: {
          username,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.json({ errors: [{ msg: 'username already exists' }] });
      }
    }

    const { userWithoutPw, token } = await userAndTokenAfterChange(user);

    res.json({ userWithoutPw, token });
  },
];

const handleEmailChange = [
  isLoggedIn,
  validateUserSettingsChange[1],
  async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { id, email } = req.body;
    let user;

    try {
      user = await prisma.user.update({
        where: {
          id
        },
        data: {
          email,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.json({ errors: [{ msg: 'email already exists' }] });
      }
    }

    const { userWithoutPw, token } = await userAndTokenAfterChange(user);

    res.json({ userWithoutPw, token });
  },
];

const handlePasswordChange = [
  isLoggedIn,
  validateUserSettingsChange[2],
  validateUserSettingsChange[3],
  asyncHandle(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { id, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: {
        id
      },
      data: {
        password: hashedPassword,
      },
    });

    const { userWithoutPw, token } = await userAndTokenAfterChange(user);
    res.json({ userWithoutPw, token });
  })
];

const handleAvatarChange = [
  isLoggedIn,
  validateUserSettingsChange[4],
  asyncHandle(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { id, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: {
        id
      },
      data: {
        avatarUrl,
      },
    });

    const { userWithoutPw, token } = await userAndTokenAfterChange(user);
    res.json({ userWithoutPw, token });
  }),
];

module.exports = {
  handleUserSignIn,
  handleUserSignUp,
  verifyUserLogIn,
  handleUsernameChange,
  handleEmailChange,
  handlePasswordChange,
  handleAvatarChange,
};
