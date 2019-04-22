import { AuthenticationError } from 'apollo-server-express'
import { User } from './models'

const signedIn = req => req.session.userId

export const isAuthenticated = req => {
  if (!req || !req.session || !req.session.userId) {
    // user is not logged in
    throw new Error('Not authenticated!')
  }
}

export const checkSignedIn = req => {
  if (!signedIn(req)) {
    throw new AuthenticationError(`You must be signed in!`)
  }
}

export const checkSignedOut = req => {
  if (signedIn(req)) {
    throw new AuthenticationError(`You are already signed in!`)
  }
}

export const signOut = (req, res) =>
  new Promise((resolve, reject) => {
    req.session.destroy(err => {
      if (err) reject(err)

      res.clearCookie(process.env.SESS_NAME)

      resolve(true)
    })
  })
