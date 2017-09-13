// utilities to interface with the 1uphealth api servers side
const request = require('request')
const ONEUP_DEMOWEBAPPLOCAL_CLIENTID = process.env.ONEUP_DEMOWEBAPPLOCAL_CLIENTID
const ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET = process.env.ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET
let accessTokenCache = {}

// create new 1uphealth user
function createOneUpUser (email, callback) {
  let url = `https://api.1up.health/user-management/v1/user?app_user_id=${email}&client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}`
  request.post(url, function(error, response, body) {
    if(error) {
      console.log('Error POSTing to 1up user-management: ', error);
      callback()
    } else {
      body = JSON.parse(body)
      let oneupUserId = body.oneup_user_id
      request.post(`https://api.1up.health/fhir/oauth2/token?client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}&code=${body.code}&grant_type=authorization_code`, function(error, response, body) {
        body = JSON.parse(body)
        console.log('createOneUpUser body2',body)
        // never send the body.refrsh_token client side
        // this access token must be refreshed after 2 hours
        accessTokenCache[email] = body.access_token
        callback(oneupUserId)
      })
    }
  })
}

// check for 1upehealth user
function getOneUpUserId (email, callback) {
  request.get(`https://api.1up.health/user-management/v1/user?client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}&app_user_id=${email}`, function(error, response, body) {
    body = JSON.parse(body)
    callback(body.oneup_user_id)
  })
}

// gets the 1uphealth user id from the user email address
function getOrMakeOneUpUserId (email, callback) {
  getOneUpUserId (email, function(oneupUserId){
    if (typeof oneupUserId === 'undefined' || typeof accessTokenCache[email] === 'undefined') {
      createOneUpUser(email, function (oneupUserId) {
        console.log('createOneUpUser oneupUserId', oneupUserId)
        callback(oneupUserId)
      })
    } else {
      console.log('getOneUpUserId oneupUserId', oneupUserId)
      callback(oneupUserId)
    }
  })
}

// gets a fhir resource list for a user
function getFhirResourceBundle (resourceType, email, callback) {
  let url = `https://api.1up.health/fhir/dstu2/${resourceType}`
  let options = {
    url: url,
    header: {
      authorization: `Bearer ${accessTokenCache[email]}`
    }
  }
  request.get(options, function(error, response, body) {
    callback(body)
  })
}

exports.accessTokenCache = accessTokenCache
exports.getOrMakeOneUpUserId = getOrMakeOneUpUserId
exports.getFhirResourceBundle = getFhirResourceBundle
