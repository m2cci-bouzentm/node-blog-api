const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');


const validateComment = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content cannot be empty')
    .isLength({ min: 1, max: 1000 }).withMessage('Comment content must be at least 1 characters long')
];


const prisma = new PrismaClient();


const getCommentsByPostId = asyncHandle(async (req, res, next) => {
  const { postId } = req.params;

  const comments = await prisma.comment.findMany({
    where: {
      postId
    },
    orderBy: {
      publishedAt: 'asc',
    },

  });

  res.json(comments);
})


const createCommentOnPost = [validateComment, asyncHandle(async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json({ errors: result.array() });
  }

  const { postId } = req.params;
  const { content, authorId } = req.body;

  const comment = await prisma.comment.create({
    data: {
      content, postId, authorId
    },

  });

  res.json(comment);
})];

const updateComment = [validateComment, asyncHandle(async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json({ errors: result.array() });
  }

  const { id } = req.params;
  const { content, authorId } = req.body;

  // role USER can update only his own comments
  if (req.currentUser && req.currentUser.role === 'USER' && req.currentUser.id !== authorId) {
    return res.sendStatus(403);
  }

  const comment = await prisma.comment.update({
    where: {
      id
    },
    data: {
      content
    },
  });

  res.json(comment);
})];

const deleteComment = asyncHandle(async (req, res, next) => {
  const { id } = req.params;

  const { authorId } = req.body;

  // role USER can delete only his own comments
  if (req.currentUser && req.currentUser.role === 'USER' && req.currentUser.id !== authorId) {
    return res.sendStatus(403);
  }


  const comment = await prisma.comment.delete({
    where: {
      id
    },
  });

  res.json(comment);
});




module.exports = {
  getCommentsByPostId,
  createCommentOnPost,
  updateComment,
  deleteComment,
};