const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');


const validatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),

  body('content')
    .trim()
    .notEmpty().withMessage('Post content cannot be empty')
    .isLength({ min: 10, max: 1500 }).withMessage('Post content must be at least 10 characters long')
];


const prisma = new PrismaClient();


const getPosts = asyncHandle(async (req, res, next) => {

  const posts = await prisma.post.findMany({
    include: {
      comments: true,
    }
  });

  res.json(posts);
})

const getPostById = asyncHandle(async (req, res, next) => {

  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id
    },
    include: {
      author: true,
      comments: {
        include: {
          author: true
        }
      }
    }
  });

  res.json(post);
})


const createPost = [validatePost, asyncHandle(async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json({ errors: result.array() });
  }

  const { title, content, authorId } = req.body;

  const post = await prisma.post.create({
    data: {
      title, content, authorId
    },
  });

  res.json(post);
})];

const updatePost = [validatePost, asyncHandle(async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json({ errors: result.array() });
  }

  const { id } = req.params;
  const { title, content, authorId } = req.body;

  const post = await prisma.post.update({
    where: {
      id
    },
    data: {
      title, content, authorId
    },
  });

  res.json(post);
})];

const deletePost = asyncHandle(async (req, res, next) => {
  const { id } = req.params;

  const post = await prisma.post.delete({
    where: {
      id
    },
  });

  res.json(post);
});




module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};