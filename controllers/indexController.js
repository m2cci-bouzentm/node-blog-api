require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const prisma = new PrismaClient();

const validateUserSignUp = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Comment content cannot be empty')
    .isLength({ min: 1, max: 1500 })
    .withMessage('Comment content must be at least 1 characters long'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Password must be at least 1 characters long'),
  body('passwordConfirmation')
    .trim()
    .notEmpty()
    .withMessage('Confirm password cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Confirm password must be at least 1 characters long')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

const verifyUser = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  if (!user) {
    return { message: 'Incorrect username' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { message: 'Incorrect password' }
  }

  return { user };
}
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader === 'undefined') {
    return next(new Error("User Not Logged In"));
  }

  req.token = bearerHeader.split(' ')[1];
  next();
}

// TODO user validation && asyncHandler
// TODO passport verify function of local strategy
const handleUserSignIn = async (req, res, next) => {
  const { username, password } = req.body;
  const verifyUserRes = await verifyUser(username, password);

  // failed attempt to log in
  if (typeof verifyUserRes.message !== "undefined") {
    return res.json(verifyUserRes)
  }
  const userWithoutPw = { ...verifyUserRes.user, password: '' };

  jwt.sign(userWithoutPw, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
    if (err) return next(err);
    res.json({ user: userWithoutPw, token });
  });

};

const handleLoggedInVerification = [
  verifyToken,
  (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        res.sendStatus(403);
      } else {
        res.json(user)
      }
    })
  }];


const handleUserSignUp = asyncHandle(async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json({ errors: result.array() });
  }

  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  // console.log(hashedPassword);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  // TODO log in user
  jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
    if (err) return next(err);
    res.json({ user, token });
  });

});

const handleUserSignOut = (req, res, next) => { };

module.exports = {
  handleUserSignIn,
  handleUserSignUp,
  handleUserSignOut,
  handleLoggedInVerification,
};
