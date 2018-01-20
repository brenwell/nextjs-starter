var express = require('express')
var router = express.Router()


// Expose a route to return user profile if logged in with a session
router.get('/user', isAuth, (req, res) => {
      userdb.findOne({'_id': req.user.id}, (err, user) => {
        if (err || !user)
          return res.status(500).json({error: 'Unable to fetch profile'})
        res.json({
          name: user.name,
          email: user.email,
          emailVerified: (user.emailVerified && user.emailVerified === true) ? true : false,
          linkedWithFacebook: (user.facebook && user.facebook.id) ? true : false,
          linkedWithGoogle: (user.google && user.google.id) ? true : false,
          linkedWithTwitter: (user.twitter && user.twitter.id) ? true : false
        })
      })
})

// Expose a route to allow users to update their profiles (name, email)
router.post('/user', isAuth, (req, res) => {
      userdb.findOne({'_id': req.user.id}, (err, user) => {
        if (err || !user)
          return res.status(500).json({error: 'Unable to fetch profile'})

          if (req.body.name)
          user.name = req.body.name

        if (req.body.email) {
          // Reset email verification field if email address has changed
          if (req.body.email && req.body.email !== user.email)
            user.emailVerified = false

          user.email = req.body.email
        }
        userdb.update({'_id': user._id}, user, {}, (err) => {
          if (err)
            return res.status(500).json({error: 'Unable save changes to profile'})
          return res.status(204).redirect('/account')
        })
      })
  })

// Expose a route to allow users to delete their profile.
router.post('/delete', isAuth, (req, res) => {
      userdb.remove({'_id': req.user.id}, (err, user) => {
        if (err || !user)
          return res.status(500).json({error: 'Unable to delete profile'})
        // When the account has been deleted, redirect client to /auth/callback
        // to ensure the client has it's local session state updated to reflect
        // that the user is no longer logged in.
        return res.status(204).redirect('/auth/callback')
      })
})

module.exports = router

function isAuth(req, res, next)
{
    if (req && req.user) return next();

    // res.status(403).json({error: 'Must by signed in to execute the route you are attempting'})
    return res.redirect('/error/unauthorized')
}