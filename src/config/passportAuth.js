import passport from 'passport'

const passportAuth = app => {
  app.get('/auth/github', passport.authenticate('github', { session: false }))

  app.get(
    '/auth/github/redirect',
    passport.authenticate('github', {
      session: false,
      failureRedirect: '/login',
    }),
    (req, res) => {
      if (req.user.user.id && req.session) {
        req.session.userId = req.user.user.id
        req.session.accessToken = req.user.accessToken
        req.session.refreshToken = req.user.refreshToken
      }

      res.redirect(process.env.FRONTEND_URL)
    },
  )

  app.get(
    '/auth/google',
    passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
    }),
  )

  app.get(
    '/auth/google/redirect',
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/login',
    }),
    (req, res) => {
      if (req.user.user.id && req.session) {
        req.session.userId = req.user.user.id
        req.session.accessToken = req.user.accessToken
        req.session.refreshToken = req.user.refreshToken
      }

      res.redirect(process.env.FRONTEND_URL)
    },
  )
}

export default passportAuth
