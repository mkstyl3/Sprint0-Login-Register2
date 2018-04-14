//const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        required: true
    },
    local: {
        username: {
            type: String,
            trim: true //Avoid spaces e.g "hello   " , "_hello" and save "hello" in db
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            trim: true
        }
    },
    google: {
        id: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        }
    },
    facebook: {
        id: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        }
    }
});
//hashing a password before saving it to the database
userSchema.pre('save', async function (next) {
    try {
        if(this.method !== 'local') {
            next();
        }

        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Generate hashed password (salt + hash)
        this.local.password = await bcrypt.hash(this.local.password, salt);
        //user.password = await crypto.createHash('sha256').update(user.password).digest('hex');
        next();
    } catch(error) {
        next(error);
    }
});

userSchema.methods.isValidPassword = async function(newPassword) {
    try {
        return await bcrypt.compare(newPassword, this.local.password);
    } catch(error) {
        throw new Error(error); // We can't access to the next variable, so we throw a new error
    }
};

//Export the model
module.exports = mongoose.model('User', userSchema);