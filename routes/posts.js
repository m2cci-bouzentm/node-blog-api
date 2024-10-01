const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');


router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPostById);

// TODO will be protected routes
router.post('/', postsController.createPost);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

module.exports = router;
