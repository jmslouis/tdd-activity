const mongoose = require('./connection');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
  }
);

const Post = mongoose.model('posts', postSchema);

// Saving a post given the validated object
exports.create = (obj, next) => {
  const post = new Post(obj);

  post.save(function(err, post) {
    next(err, post);
  });
};

// Retrieving a post based on ID
exports.getById = function(id, next) {
  Post.findById(id).populate('author', 'name').exec((err, post) => {
    next(err, post);
  });
};

// Retrieving all posts by the user
exports.getByUser = (user, next) => {
  Post.find({ author: user }, (err, posts) => {
    next(err, posts);
  });
};
