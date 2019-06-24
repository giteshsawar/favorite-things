const express = require('express');
const os = require('os');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose =  require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var expressip = require('express-ip');

const app = express();
app.use(expressip().getIpInfoMiddleware);

//Configuration Files
var dbConfig = require('./config/dbConfig');
session
//Database Connection
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.connection);
require('./models/models');
var db = mongoose.connection;

app.use(logger('dev'));                                         
app.use(cookieParser('secretKey'));
app.use(bodyParser.json({limit: "10mb"}));
app.use(bodyParser.urlencoded({limit: "10mb", extended: true, parameterLimit:50000}));
app.use(session({
    secret: 'secretKey',
    saveUninitialized: true,
    cookie: { maxAge: 8*60*60*1000 },
    resave: false,
    store: new MongoStore({ url: dbConfig.connection })
}));

//Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

var initPassport = require('./passport_init');
initPassport(passport);

var auth = require('./routes/auth')(passport);
var favourites = require('./routes/favourites');

//Middlewares
app.use('/auth', auth);
app.use('/favourites', favourites);

app.use(express.static('dist'));

// Handles any requests that don't match the ones above
// app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'), (err) => {
        console.log('got error', err);
    });
});

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
