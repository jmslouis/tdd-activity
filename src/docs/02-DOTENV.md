# Using environment variables
Before deployment, it's a good practice to use environment variables for private information such as database connection URIs, secret hash keys and other API keys. Additionally, development and production ports are usually different depending on the provider so this can also be set in an environment variable.

Although environment variables can be set in the **command line** when running the application, it's best to keep it organized in a `.env` file instead.

To use `dotenv`, we need to first install it as a development dependency. We're keeping it as a `devDependencies` because we don't really need this module while the application is running.
```shell
npm install dotenv --save-dev
```

Create a new file `.env`. In this file, set the port, the MongoDB connection URL and the value of `secret` in the `express-session` options in [`app.js`](../app.js).

```dotenv
PORT=
MONGODB_URL=""
SESSION_SECRET=""
```

Create another file and name it `config.js`. This file will use the `dotenv` module to load the variables from the `.env` file to the `process.env` property of Node.js. Then, we'll map these variables to an `exports` object so that it can be used as a module in the other files.

```JavaScript
module.exports = {
  envPort: process.env.PORT,
  dbURL: process.env.MONGODB_URL,
  sessionKey: process.env.SESSION_SECRET,
};
```

Since we only installed this as a dev dependency, we're not using `require('dotenv')` to reduce the modules we load on runtime. To mitigate this and let this `config.js` go throuogh `dotenv`, we simply update the `scripts` in our [`package.json`](../package.json):
```json
"scripts": {
  "debug": "nodemon -r dotenv/config app.js",
  "dev": "node -r dotenv/config app.js"
},
```

By adding the `-r dotenv/config` to the command line, this is basically preloading the environment variables to `process.env` and makes it available to the entire app through the `config.js` exports we did.

Update [`app.js`](../app.js) to use the environment variables from `config.js`.

```JavaScript
const { envPort, sessionKey } = require('./config');

const app = express();
const port = envPort || 9090;

//...

app.use(session({
  secret: sessionKey,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
```

Also update [`connection.js`](../models/connection.js) to use the database URL from the environment variable.

```JavaScript
const mongoose = require('mongoose');
const { dbURL } = require('../config');

const options = { useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false };

mongoose.connect(dbURL, options);

module.exports = mongoose;
```

Save everything and test out the application by running:
```shell
npm run dev
```

#### Next: [03-HEROKU.md](03-HEROKU.md)
