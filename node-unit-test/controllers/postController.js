const postModel = require('../models/post');
// const { validationResult } = require('express-validator');

exports.addPost = (req, res) => {
  // const errors = validationResult(req);

  // if (errors.isEmpty()) {
    const {
      title,
      content
    } = req.body;

    const author = req.session.user;

    postModel.create({ title, content, author}, (err, post) => {
      if (err) {
        req.flash('error_msg', 'Could not create post. Please try again.');
        res.redirect('/posts/add');
      } else {
        res.redirect('/posts');
      }
    });
  } else {
    const messages = errors.array().map((item) => item.msg);

    req.flash('error_msg', messages.join(' '));
    res.redirect('/posts/add');
  }

};

exports.getUserPosts = (user, callback) => {
  postModel.getByUser(user, (err, posts) => {
    if (err) throw err;

    const postObjects = [];

    posts.forEach(function(doc) {
      postObjects.push(doc.toObject());
    });

    callback(postObjects);
  });
};

exports.getPost = (req, res) => {
  const postId = req.params.id;

  postModel.getById(postId, (err, post) => {

    res.render('singlepost', { pageTitle: post.title, post: post.toObject()});
  });
}
