// This file is initializing the mongodb connection
// and exporting it for use in all other files through the module.exports
const mongoose = require('mongoose');
const databaseURL = 'mongodb+srv://jmsballatan:04q3srM1Cx5h6A92@stsweng-test.nmywbmx.mongodb.net/logindb?retryWrites=true&w=majority';

const options = { useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false };

mongoose.connect(databaseURL, options);

module.exports = mongoose;
