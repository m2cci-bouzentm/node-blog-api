const express = require('express');
const router = express.Router({ mergeParams: true });
const commentsController = require('../controllers/commentsController');

const isAuthorized = (req, res, next) => {


  next();
}

router.get('/', commentsController.getCommentsByPostId);

// TODO will be protected routes

router.use(isAuthorized);

router.post('/', commentsController.createCommentOnPost);
router.put('/:id', commentsController.updateComment);
router.delete('/:id', commentsController.deleteComment);

module.exports = router;
