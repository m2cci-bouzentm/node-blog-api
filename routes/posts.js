const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');


router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPostById);
router.post('/', postsController.createPost);

module.exports = router;
