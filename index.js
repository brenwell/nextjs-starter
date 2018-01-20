'use strict'

const express = require('express')
const session = require('express-session')
const next = require('next')
const auth = require('./routes/auth')
const cookieParser = require('cookie-parser')
const Mail = require('./lib/mail')
const MongoStore = require('connect-mongo')(session)
const DB = require('./lib/db')
const accountRouter = require('./routes/account')

// Load environment variables from .env file if present
require('dotenv').load()

// now-logs allows remote debugging if deploying to now.sh
if (process.env.LOGS_SECRET) {
  require('now-logs')(process.env.LOGS_SECRET)
}

process.on('uncaughtException', function(err) {
  console.error('Uncaught Exception: ', err)
})

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection: Promise:', p, 'Reason:', reason)
})

// Default when run with `npm start` is 'production' and default port is '80'
// `npm run dev` defaults mode to 'development' & port to '3000'
process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.PORT = process.env.PORT || 80

// Define the session secret (should be unique to your site)
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'change-me'

// connect to db
const db = DB(process.env.USER_DB_CONNECTION_STRING)

// setup mailgun
const mailer = Mail(process.env.MAILGUN_API_KEY, process.env.MAILGUN_DOMAIN, process.env.EMAIL_ADDRESS)

// setup app
const expressApp = express()

const nextApp = next({
  dir: '.',
  dev: (process.env.NODE_ENV === 'development')
})


// We use cookie-parser to parse cookies and populate req.cookies in express
// (this makes cookies easier to work with in pages when rendering server side)
expressApp.use(cookieParser())

let userdb, sessionStore

nextApp.prepare()
.then(() => {
  // Connect to the user database
    return new Promise((resolve, reject) => {
        db.getUserCollection().then((collection) => {
            userdb = collection
            resolve(true)
        })
    })

})
.then(() => {
    // Configure a session store and connect it to the session database
    return new Promise((resolve, reject) => {
      sessionStore = new MongoStore({
         url: process.env.SESSION_DB_CONNECTION_STRING,
         autoRemove: 'interval',
         autoRemoveInterval: 10, // Removes expired sessions every 10 minutes
         collection: 'sessions',
         stringify: false
      })
      resolve(true)
  })
})
.then(() => {
  // Once DB connections are available, can configure authentication routes
  auth.configure({
    nextApp: nextApp,
    expressApp: expressApp,
    userdb: userdb,
    session: session,
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    mailserver: mailer,
    serverUrl: process.env.SERVER_URL || null
  })

  // Serve fonts from ionicon npm module
  expressApp.use('/fonts/ionicons', express.static('./node_modules/ionicons/dist/fonts'))

  // Routes
  expressApp.use('/account', accountRouter)

  // Default catch-all handler to allow Next.js to handle all other routes
  expressApp.all('*', (req, res) => {
    let nextRequestHandler = nextApp.getRequestHandler()
    return nextRequestHandler(req, res)
  })

  expressApp.listen(process.env.PORT, err => {
    if (err) {
      throw err
    }
    console.log('> Ready on http://localhost:' + process.env.PORT + ' [' + process.env.NODE_ENV + ']')
  })
})
.catch(err => {
  console.log('An error occurred, unable to start the server')
  console.log(err)
})

