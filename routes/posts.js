const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

const isAuthorized = (req, res, next) => {
  console.log("user authorizing ...");

  // if not logged in or an author return 403 forbidden
  if (req.currentUser === null || req.currentUser.role !== 'AUTHOR') {
    return res.sendStatus(403);
  }

  console.log("user is authorized");
  next();
}



router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPostById);


// protected routes
router.post('/', isAuthorized, postsController.createPost);
router.put('/:id', isAuthorized, postsController.updatePost);
router.delete('/:id', isAuthorized, postsController.deletePost);

router.put('/publish/:id', isAuthorized, postsController.updatePostPublishState);

module.exports = router;
