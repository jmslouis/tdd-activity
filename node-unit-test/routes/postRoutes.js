const router = require('express').Router();
const postController = require('../controllers/postController');
const { postValidation } = require('../validators.js');
const { isPrivate } = require('../middlewares/checkAuth');

router.get('/', isPrivate, (req, res) => {
  const user = req.session.user;

  postController.getUserPosts(user, (posts) => {
    res.render('allposts', { pageTitle: 'Posts', posts })
  });
});

router.get('/add', isPrivate, postValidation, (req, res) => {
  res.render('newpost', { pageTitle: 'New Post' });
});

router.get('/:id', isPrivate, postController.getPost);


router.post('/add', postController.addPost);

module.exports = router;
