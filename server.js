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
      && typeof req.session.passwordless !== 'undefined') {
    req.session.oneup_access_token = oneup.accessTokenCache[req.session.passwordless]
    next()
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
  server.use(auth.acceptToken({ successRedirect: '/' }))

  server.post('/sendtoken', auth.requestToken((email, delivery, fn) =>
  fn(null, email)), (req, res) => res.json('ok'))

  server.get('/me', (req, res) => res.json(req.user || null))

  server.get('/logout', (req, res) => {
    req.session = null
    res.redirect('/login')
  })
  // server.get('/logout', (req, res) => {
  //   req.session.destroy(() => {
  //     res.redirect('/')
  //   })
  // })
  server.post('/logout', (req, res) => {
    req.session = null;
    req.user = null;
    res.json('ok');
  })

  server.get('/timeline', authUser, (req, res) => {
    app.render(req, res, '/timeline', req.params)
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
