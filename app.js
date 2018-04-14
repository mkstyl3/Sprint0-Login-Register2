const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const app = express();


////////// Middlewares //////////

// Cors (dev)
app.use(cors());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev')); // Morgan logger
app.use(bodyParser.json()); // ExpressJS will parse the request before it got routed

app.use(express.static(path.join(__dirname, 'public')));

// Cookie (24h)
/*app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [config.session.cookieKey]
}));*/

// Passport
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/escuela', function(err, res) {
    if(err) throw err;
    console.log('Connected to Database');
});


module.exports = app;
