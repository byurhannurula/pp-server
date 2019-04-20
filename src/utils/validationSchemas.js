import * as yup from 'yup'

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(3)
    .max(255),
  email: yup
    .string()
    .email()
    .min(3)
    .max(255),
  password: yup
    .string()
    .min(8)
    .max(255),
})

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .min(3)
    .max(255),
  password: yup
    .string()
    .min(8)
    .max(255),
})
