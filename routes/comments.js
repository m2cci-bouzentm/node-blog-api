const express = require('express');
const router = express.Router({ mergeParams: true });
const commentsController = require('../controllers/commentsController');


router.get('/', commentsController.getCommentsByPostId);

// TODO will be only user authenticated routes

// router.use(isAuthenticated);

router.post('/', commentsController.createCommentOnPost);
router.put('/:id', commentsController.updateComment);
router.delete('/:id', commentsController.deleteComment);

module.exports = router;
