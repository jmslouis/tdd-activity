// All imports needed here
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');
const bodyParser = require('body-parser');
const mongoose = require('./models/connection');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);
const moment = require('moment');

// Routes imports
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/postRoutes');

// Creates the express application
const app = express();
const port = 9090;

// Listening to the port provided
app.listen(port, () => {
  console.log('App listening at port ' + port)
});

// Creates an engine called "hbs" using the express-handlebars package.
app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultView: 'main',
  layoutsDir: path.join(__dirname, '/views/layouts'),
  partialsDir: path.join(__dirname, '/views/partials'),
  helpers: {
    preview: function(str) {
      if (str.length > 100)
        return str.substring(0,100) + '...';
      return str;
    },
    // Taken from https://gist.github.com/elidupuis/1468937/caec40920ca76302f0fd3b218a763fa118e1901c
    // usage {{dateFormat creation_date format="MMMM YYYY"}}
    dateFormat: function(context, block) {
      var f = block.hash.format || "MMMM DD YYYY, h:mm a";
      return moment(new Date(context), "YYYY-MM-DDTHH:mm:ss.SSSZ").format(f);
    }
  }
}));

// Setting the view engine to the express-handlebars engine we created
app.set('view engine', 'hbs');

// Configuration for handling API endpoint data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// serve static files
app.use(express.static('public'));

// Insert server configuration after this comment
// Sessions
app.use(session({
  secret: 'somegibberishsecret',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

// Flash
app.use(flash());

// Global messages vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.isAuthenticated = req.session.user ? true : false;
  next();
});


app.use('/', authRouter); // Login/registration routes
app.use('/', indexRouter); // Main index route
app.use('/posts', postsRouter); // Posts routes
