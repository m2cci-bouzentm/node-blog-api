require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const expressSession = require('express-session');
// const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

const prisma = new PrismaClient();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));

// authentication: jwt verification custom middleware to no which user is asking for resources
app.use(function jwtVerification(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader === 'undefined') {
    req.currentUser = null;
    return next();
  }

  req.token = bearerHeader.split(' ')[1];
  jwt.verify(req.token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      req.currentUser = null;
      req.jwtErrorMessage = err;
    } else {
      req.currentUser = user;
    }

    next();
  });
});

app.get('/', (req, res, next) => res.redirect('/posts'));
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/posts/:postId/comments', commentsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
