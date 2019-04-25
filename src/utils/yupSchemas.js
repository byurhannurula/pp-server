import * as yup from 'yup'

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(3)
    .max(255)
    .label('Name'),
  email: yup
    .string()
    .email()
    .min(3)
    .max(255)
    .label('Email'),
  password: yup
    .string()
    .min(8)
    .max(255)
    .label('Password')
    .matches(
      /^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d).*$/,
      'Password must be at lest 8 characters, one lowercase, one uppercase and one digit!',
    ),
})

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .min(3)
    .max(255)
    .label('Email'),
  password: yup
    .string()
    .min(8)
    .max(255)
    .label('Password')
    .matches(
      /^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d).*$/,
      'Password must be at lest 8 characters, one lowercase, one uppercase and one digit!',
    ),
})

export const startRoom = yup.object().shape({
  title: yup
    .string()
    .min(3)
    .max(255)
    .label('Title'),
})
