const passwordless = require('passwordless')
const MemoryStore = require('passwordless-memorystore')
const email = require('emailjs')
const oneup = require('./oneup.js')
const config = require('./config.json')

const smtpServer = email.server.connect(config.emailServer)

passwordless.init(new MemoryStore(), {skipForceSessionSave:true})
passwordless.addDelivery((token, uid, recipient, callback) => {
  console.log('recipient',recipient)
  oneup.getOrMakeOneUpUserId(recipient, function(oneupUserId){})
  smtpServer.send({
    text: `Welcome to the 1upHealth Demo! Click this link to login \n\n\n\n${config.baseURL}/?token=${token}&uid=${uid} \n\n`,
    attachment: {data: `Welcome to the 1upHealth Demo Click <a href="${config.baseURL}/?token=${token}&uid=${uid}">this link</a> to login`, alternative: true},
    from: config.email.sender,
    to: recipient,
    subject: '1upHealth demo login token'
  }, callback)
})

module.exports = passwordless
