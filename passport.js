const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require ('passport-local').Strategy;
const GooglePlusTokenStrategy = require ('passport-google-plus-token');
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('./config');
const User = require('./models/User');
const keys = require('./config/keys.js');
const GoogleStrategy = require('passport-google-oauth20');

//JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET
}, async(payload, done) => {
    try {
        // Find the user specified in token
        const user = await User.findById(payload.sub);

        // If user doesn't exists, handle it
        if (!user) {
            return done(null, false);
        }

        // Otherwise, return the user
        done(null, user);
    } catch(error) {
        done(error, false);
    }
}));

//JS Style
passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

//GOOGLE OAUTH STRATEGY
passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        console.log('profile', profile);

        // Check whether this current user exists in our DB
        const existingUser = await User.findOne({'google.id': profile.id});
        if (existingUser) {
            console.log('User already exists in our DB');
            return done(null, existingUser);
        }

        console.log('User doesn\'t exists, we\'re creating a new one');

        // If user does not exist, new account
        const newUser = new User({
            method: 'google',
            google: {
                id: profile.id
                //email missing
            }
        });

        await newUser.save();
        done(null, newUser);
    } catch (error) {
        done(error, false, error.message);
    }
}));

passport.use(new GoogleStrategy({
        callbackURL: '/login/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, ()=> {
        // Passport callback function
    })
);

//LOCAL STRATEGY

passport.use(new LocalStrategy({
    usernameField: 'username'
}, async (username, password, done) => {

    try { // Find the user given the username
        const user = await User.findOne({ "local.username": username });

        // If not, handle it
        if (!user) {
            return done(null, false);
        }
        // Check if the password is correct
        const isMatch = await user.isValidPassword(password);

        //If not, handle it
        if (!isMatch) {
            return done(null, false);
        }

        //Otherwise, return the user
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));
