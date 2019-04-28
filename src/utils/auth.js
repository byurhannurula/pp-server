import { AuthenticationError } from 'apollo-server-express'

export const isAuthenticated = req => {
  if (!req || !req.session || !req.session.userId) {
    // user is not logged in
    throw new AuthenticationError('Not authenticated!')
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
