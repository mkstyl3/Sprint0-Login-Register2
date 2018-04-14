const Joi = require('joi');

module.exports = {
    validateBody: (schema) => {
        return (req, res, next) => {
            const result = Joi.validate(req.body, schema);
            if(result.error) {
                return res.status(400).json(result.error);
            }
            //req.value.body instead req.body
            if(!req.value) { req.value = {}; }
            req.value['body'] = result.value;
            next();
         }
    },

    schemas: {
        authSchema: Joi.object().keys({
            email: Joi.string().email().required(),
            //remember to limit the password length etc
            password: Joi.string().required(),
            username: Joi.string().required()
        })
    }
}