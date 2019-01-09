import { AuthenticationError } from 'apollo-server-express'
import { User } from './models'

const signedIn = req => req.session.userId

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

export const attemptSignIn = async (username, password) => {
  const user = await User.findOne({ username })

  if (!user || !(await user.matchesPassword(password))) {
    throw new AuthenticationError(
      'Incorrect username or password. Please try again.',
    )
  }

  return user
}
