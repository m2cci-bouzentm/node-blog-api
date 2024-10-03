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

// TODO user validation && asyncHandler
const handleUserSignIn = async (req, res, next) => {
  // TODO passport verify function of local strategy
  const auth = await passport.authenticate('local', { failureMessage: true });

  console.log(auth);

  // jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
  //   if (err) return next(err);
  //   res.json({ user, token });
  // });
};
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
};
