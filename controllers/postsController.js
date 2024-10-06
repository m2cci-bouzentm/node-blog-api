const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const validatePost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),

  body('content').trim().notEmpty().withMessage('Post content cannot be empty'),
  body('thumbnailUrl'),
];

const prisma = new PrismaClient();

const getPosts = asyncHandle(async (req, res, next) => {
  let posts;

  // return all posts to the author with comments
  if (req.currentUser !== null && req.currentUser.role === 'AUTHOR') {
    posts = await prisma.post.findMany({
      include: { comments: true, author: true },
      orderBy: {
        publishedAt: 'desc'
      }
    });
  } else {
    posts = await prisma.post.findMany({
      where: {
        isPublished: true,
      },
      include: {
        author: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });
  }

  res.json(posts);
});

const getPostById = asyncHandle(async (req, res, next) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    include: {
      author: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
      },
    },
  });

  res.json(post);
});

const createPost = [
  validatePost,
  asyncHandle(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    if (req.body.isPublished === 'true') {
      req.body.isPublished = true;
    } else {
      req.body.isPublished = false;
    }

    const { title, content, isPublished } = req.body;
    const authorId = req.currentUser.id;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        isPublished,
        authorId,
      },
    });

    res.json(post);
  }),
];

const updatePost = [
  validatePost,
  asyncHandle(async (req, res, next) => {
    const result = validationResult(req);


    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    console.log('editing a post');

    if (req.body.isPublished === 'true') {
      req.body.isPublished = true;
    } else {
      req.body.isPublished = false;
    }

    const { id } = req.params;
    const { title, content, thumbnailUrl, authorId } = req.body;

    const post = await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        // authorId, // do not update the initial author, maybe add editedById field in the db
        thumbnailUrl,
      },
    });

    console.log('edited a post successfully');

    res.json(post);
  }),
];

const updatePostPublishState = asyncHandle(async (req, res, next) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  if (isPublished) {
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        isPublished,
        publishedAt: new Date()
      },
    });
  } else {
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        isPublished,
      },
    });
  }

  res.json({ msg: 'edited a post publish status successfully' });
});

const deletePost = asyncHandle(async (req, res, next) => {
  const { id } = req.params;
  const { commentsCount } = req.body;

  if (commentsCount > 0) {
    await prisma.comment.deleteMany({
      where: {
        postId: id
      },
    });
  }

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
  updatePostPublishState,
  deletePost,
};
