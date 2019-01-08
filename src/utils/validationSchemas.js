import Joi from 'joi'

export const registerSchema = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .max(254)
    .required()
    .label('Name'),
  username: Joi.string()
    .alphanum()
    .min(4)
    .max(254)
    .required()
    .regex(/^[a-zA-Z0-9]*$/)
    .label('Username'),
  email: Joi.string()
    .email()
    .required()
    .label('Email'),
  password: Joi.string()
    .min(8)
    .max(254)
    .required()
    .regex(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d).*$/)
    .label('Passowrd')
    .options({
      language: {
        string: {
          regex: {
            base:
              'must contain at least 8 character, one uppercase, one lowercase and one digit!',
          },
        },
      },
    }),
})
