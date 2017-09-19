const express = require('express')
// const session = require('express-session')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const next = require('next')
const auth = require('./auth')
const oneup = require('./oneup')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dir: '.', dev })
const handle = app.getRequestHandler()

function authUser(req, res, next) {
  if( typeof req.session !== 'undefined'
      && Object.keys(req.session).length > 0
      && typeof req.session.passwordless !== 'undefined'
      || typeof req.headers.authorization != 'undefined') {
    req.session.oneup_access_token = oneup.accessTokenCache[req.session.passwordless]
    if(typeof req.session.oneup_access_token === 'undefined') {
      if (typeof req.headers.authorization === 'undefined') {
        res.redirect('/login')
      } else {
        req.session.oneup_access_token = req.headers.authorization.split(' ')[1]
        next()
      }
    } else {
      next()
    }
  } else {
    res.redirect('/login')
  }
}

app.prepare()
.then(() => {
  const server = express()
  server.use(bodyParser.json())

  server.use(cookieSession({
    name: 'demoappsession',
    keys: ['Woof','Meow','Cluck'], // you should change these
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))
  // server.use(session({ secret: 'Roar!', resave: false, saveUninitialized: true }))
  server.use(auth.sessionSupport())
  server.use(auth.acceptToken({ successRedirect: '/dashboard' }))

  server.post('/sendtoken', auth.requestToken((email, delivery, fn) =>
  fn(null, email)), (req, res) => res.json('ok'))

  server.get('/me', (req, res) => res.json(req.user || null))

  server.get('/logout', (req, res) => {
    req.session = null
    res.redirect('/login')
  })

  server.post('/logout', (req, res) => {
    req.session = null;
    req.user = null;
    res.json('ok');
  })

  server.get('/callback', authUser, (req, res) => {
    res.redirect('/dashboard')
  })

  server.get('/dashboard', authUser, (req, res) => {
    app.render(req, res, '/dashboard', req.params)
  })

  // we suggest bundling your requests to the 1uphealth api on the backend
  // and presenting them to the frontend via your own api routes
  server.get('/api/dashboard', authUser, (req, res) => {
    var oneupAccessToken = req.session.oneup_access_token || req.headers.authorization.split(' ')[1]
    oneup.getAllFhirResourceBundles(oneupAccessToken, function(responseData){
      res.send({token: oneupAccessToken, resources: responseData})
    })
  })

  server.get('/', authUser, (req, res) => {
    app.render(req, res, '/index', req.params)
  })

  server.get('*', (req, res) => handle(req, res))

  server.listen(3000, err => {
    if (err) throw err
    console.log('> Next-auth ready on http://localhost:3000')
  })
})
