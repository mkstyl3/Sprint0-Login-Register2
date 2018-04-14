const JWT = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/index');

signToken = user => {
    return JWT.sign({
        iss: 'eetac',
        sub: user.id, // same as newUser._id
        iat: new Date().getTime(), // current time
        exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
    }, JWT_SECRET);
};

module.exports = {
    signUp: async(req,res,next) => { // try-catch are implicit thanks to the express-promise-router lib
        console.log('UsersController.signUp() called!');
        const { email, password, username } = req.value.body;

        //Check if there is a user with the same username
        const foundUser = await User.findOne({ "local.username": username });
        if(foundUser) {
            return res.status(403).send({ error: 'Username is already in use'});
        }

        //Create a new user
        const newUser = new User ({
            method: 'local',
            local: {
                email: email,
                password: password,
                username: username
            }
        });
        await newUser.save();

        //Respond with token
        const token = signToken(newUser);
        res.status(200).json({ token });
    },

    signIn: async(req,res,next) => { //try-catch are implicit thanks to the express-promise-router lib
        //Generate token
        const token = signToken(req.user);
        res.status(200).json({ token });
        console.log('Successful login!');
    },

    googleOAuthInit: async (req,res,next) => {
        //res.send('logging with google')
    },

    googleOAuthRedirect: async (req,res,next) => {
        console.log('we managed to get here!');
    },

    googleOAuth: async (req, res, next) => {
        //Generate token
        console.log('req.user', req.user);
        const token = signToken(req.user);
        res.status(200).json({ token });
    },

    secret: async(req,res,next) => { //try-catch are implicit thanks to the express-promise-router lib
        res.status(200).json({ secret:'resource' });
        console.log('I managed to get here!');
    }


};