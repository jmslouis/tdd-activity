const router = require('express').Router();
const postController = require('../controllers/postController');
const { isPrivate } = require('../middlewares/checkAuth');

router.get('/', isPrivate, (req, res) => {
  const user = req.session.user;

  postController.getUserPosts(user, (posts) => {
    res.render('home', { pageTitle: 'Home', name: req.session.name, posts: posts })
  });

});

module.exports = router;
