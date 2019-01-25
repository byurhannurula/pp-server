import Joi from 'joi'

export const registerSchema = Joi.object().keys({
  name: Joi.string()
    .max(254)
    .required()
    .label('Name'),
  email: Joi.string()
    .email()
    .required()
    .label('Email'),
  password: Joi.string()
    .min(8)
    .max(60)
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

export const loginSchema = Joi.object().keys({
  email: Joi.string()
    .email()
    .required()
    .label('Email'),
  password: Joi.string()
    .min(8)
    .max(60)
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
