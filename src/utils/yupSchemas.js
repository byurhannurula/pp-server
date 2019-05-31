import * as yup from 'yup'

const name = yup
  .string()
  .min(3)
  .max(255)
  .label('Name')
const email = yup
  .string()
  .email()
  .min(3)
  .max(255)
  .label('Email')

const password = yup
  .string()
  .min(8)
  .max(255)
  .label('Password')
  .matches(
    /^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d).*$/,
    'Password must be at lest 8 characters, one lowercase, one uppercase and one digit!',
  )

export const registerSchema = yup.object().shape({
  name,
  email,
  password,
})

export const loginSchema = yup.object().shape({
  email,
  password,
})

export const startSession = yup.object().shape({
  name: yup
    .string()
    .max(255)
    .required()
    .label('Title'),
})

export const pollSchema = yup.object().shape({
  topic: yup
    .string()
    .required()
    .label('Topic'),
  // description: yup
  //   .string()
  //   .required()
  //   .label('Description'),
})
