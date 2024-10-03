const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

const isAuthorized = (req, res, next) => {
  console.log("user authorizing ...");


  next();
}



router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPostById);


// TODO will be protected routes
router.post('/', isAuthorized, postsController.createPost);
router.put('/:id', isAuthorized, postsController.updatePost);
router.delete('/:id', isAuthorized, postsController.deletePost);

module.exports = router;
