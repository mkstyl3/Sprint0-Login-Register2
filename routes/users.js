const session = require('express-session');
const express = require('express');
const User = require('../models/User');
const UsersController = require('../controller/users');
const router = require('express-promise-router')(); //Invoke funct too.
const { validateBody, schemas } = require('../helpers/routeHelpers');
const passport = require('passport');
const {google} = require('googleapis');
const keys = require('../config/keys.js');

const oauth2Client = new google.auth.OAuth2(
    keys.google.clientID,
    keys.google.clientSecret,
    keys.google.callback_url
);

// generate a url that asks permissions for Google+ and Google Calendar scopes
const scopes = [
    'https://www.googleapis.com/auth/plus.me'
];

oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes
});

/* GET ALL users */
router.get('/getAll', function(req, res, next) {
    User.find(function (err, users) {
        if (err) return next(err);
        res.json(users);

    });
});

router.get('/hello', function(req, res, next) {
    res.json('hello back from the Back End!')
        .send();
});


router.route('/signup')
    .post(validateBody(schemas.authSchema), UsersController.signUp);

router.route('/signin')
    .post(validateBody(schemas.authSchema), passport.authenticate('local', { session: false }),  UsersController.signIn);

router.route('/secret')
    .get(passport.authenticate('jwt', { session: false }), UsersController.secret);

router.route('/oauth/google')
    .post(passport.authenticate('googleToken', { session: false }), UsersController.googleOAuth);

router.post('/login/google/hello', async function (req, res, next) {
    const tokens = await oauth2Client.getToken(req.body.code);
    //oauth2Client.setCredentials(tokens);


});


router.get('/login/google/init', passport.authenticate('google', {
    scope: ['profile']
}));


router.get('/login/google/redirect', async (req, res) => {
    console.log('I managed to get here!');
});


    router.get('/removeall', function (req, res, next) {
        User.remove(function (err, post) {
            if (err) return next(err);
            res.json(post);
        });
    });


//registrar-se
    router.post('/register', function (req, res, next) {
        //use schema.create to insert data into the db
        User.create(req.body, function (err, post) {
            if (err) return next(err);
            res.json(post);
        });
    });
//login
    router.post('/login', function (req, res, next) {
        const name = req.body.name;
        const password = req.body.password;
        User.findOne({name: name, password: password}, function (err, user) {
            if (err) {
                next(err);
            }
            if (!user) {
                return res.status(494).send();
            }
            return res.status(200).send('estas loegadisimo!');
        });

    });
    router.get('/removeone/:id', function (req, res, next) {
        User.findByIdAndRemove(req.params.id, function (err, post) {
            if (err) return next(err);
            res.json(post);
        });
    });
    router.get('/removeall', function (req, res, next) {
        User.remove(function (err, post) {
            if (err) return next(err);
            res.json(post);
        });
    });

    router.post('/login', function (req, res, next) {
        const name = req.body.name;
        const password = req.body.password;
        User.findOne({name: name, password: password}, function (err, user) {
            if (err) {
                next(err);
            }
            if (!user) {
                return res.status(494).send("no existe este usuario/la constraseña es incorrecta");
            }
            return res.status(200).send('estas loegadisimo!');
        });

    });
//proba
    router.post('/proba', function (req, res, next) {
        const name = req.body.name;
        const password = req.body.password;
        const address = req.body.address;

        const newuser = new User();
        newuser.name = name;
        newuser.password = password;
        newuser.address = address;
        newuser.save(function (err, saveuser) {
            if (err) {
                next(err);
            }
            res.json(saveuser);
        });

    });

    //use sessions for tracking logins
    router.use(session({
        secret: 'work hard',
        resave: true,
        saveUninitialized: false
    }));


    module.exports = router;


