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
router.use(isAuthorized);
router.post('/', postsController.createPost);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

module.exports = router;
