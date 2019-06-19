exports.getAllFhirResourceBundles = getAllFhirResourceBundles
// utilities to interface with the 1uphealth api servers side
const request = require('request')
const async = require('async');
const ONEUP_DEMOWEBAPPLOCAL_CLIENTID = process.env.ONEUP_DEMOWEBAPPLOCAL_CLIENTID
const ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET = process.env.ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET
let accessTokenCache = {}
const ROOT_API_URL = `https://api.1up.health`
const USER_API_URL = `https://api.1up.health`
const FHIR_API_URL = `https://api.1up.health/fhir`

function getAllUrlParams(url) {
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  var obj = {};
  if (queryString) {
    queryString = queryString.split('#')[0];
    var arr = queryString.split('&');
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i].split('=');
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
      if (paramName.match(/\[(\d+)?\]$/)) {
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];
        if (paramName.match(/\[\d+\]$/)) {
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          obj[key].push(paramValue);
        }
      } else {
        if (!obj[paramName]) {
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          obj[paramName].push(paramValue);
        }
      }
    }
  }
  return obj;
}

function getTokenFromAuthCode(code, callback) {
  var postUrl = `${ROOT_API_URL}/fhir/oauth2/token?client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}&code=${code}&grant_type=authorization_code`

  request.post(postUrl, function(error, response, body) {
    if(error) {
      console.log('error',error)
    }
    try {
      console.log('body',response.statusCode,body,'----')
      var jsbody = JSON.parse(body)
      console.log('createOneUpUser',body)
      // never send the body.refrsh_token client side
      // this access token must be refreshed after 2 hours
      callback(jsbody.access_token)
    } catch (error) {
      // the auth code may take a second to register, so we can try again
      console.log('error parsing getTokenFromAuthCode', body, error)
    }
  })
}

// get the Auth code for existing user
function getAuthCodeForExistingUser(email, callback){
  request.post({
    url : `${ROOT_API_URL}/user-management/v1/user/auth-code?app_user_id=${email}&client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}`
  }, (error, response , body) => {
      jsbody = JSON.parse(body)
      let oneupUserId = jsbody.oneup_user_id

      getTokenFromAuthCode(jsbody.code, function(access_token) {
      accessTokenCache[email] = access_token
      callback(oneupUserId)
      })
  })
}

// create new 1uphealth user
function createOneUpUser (email, callback) {
  let url = `${USER_API_URL}/user-management/v1/user?app_user_id=${email}&client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}`
  request.post(url, function(error, response, body) {
    if(error) {
      console.log('Error POSTing to 1up user-management: ', error);
      callback()
    } else {
        console.log('body',response.statusCode,body,'----', url)
        let jsbody = JSON.parse(body)
        let oneupUserId = jsbody.oneup_user_id
        if (jsbody.error === "this user already exists") {
          getAuthCodeForExistingUser(email, callback);
        } else {
            getTokenFromAuthCode(jsbody.code, function(access_token) {
            accessTokenCache[email] = access_token
            callback(oneupUserId)
          })
        }
      }
  })
}

// check for 1upehealth user
function getOneUpUserId (email, callback) {
  let getUrl = `${USER_API_URL}/user-management/v1/user?client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}&app_user_id=${email}`
  console.log(getUrl)
  request.get(getUrl, function(error, response, body) {
    console.log('body',response.statusCode,body,'----', getUrl)
    let jsbody = JSON.parse(body)
      callback(jsbody.oneup_user_id)
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
function getFhirResourceBundle (apiVersion, resourceType, oneupAccessToken, afterid, jsonData, callback) {
  let url = `${FHIR_API_URL}/${apiVersion}/${resourceType}/?_afterid=${afterid}`
  let options = {
    url: url,
    headers: {
      Authorization: `Bearer ${oneupAccessToken}`
    }
  }
  request.get(options, function(error, response, body) {
    // console.log('error', error)
    // console.log('url', url)
    // console.log('body', body)
    if (error) {

    } else {
      if(afterid==0){
        jsonData=JSON.parse(body)
        delete jsonData.link
      } else{
        jsonData.entry.push(...(JSON.parse(body).entry))
      }
      // console.log('body',response.statusCode,body,'----', url)
      try {
        var jsbody = JSON.parse(body)
        console.log('this is link ->', jsbody.link);
        if (jsbody.link) {
          console.log('info: ',apiVersion, resourceType, oneupAccessToken, getAllUrlParams(jsbody.link[1].url)._afterid);
          getFhirResourceBundle(apiVersion, resourceType, oneupAccessToken, getAllUrlParams(jsbody.link[1].url)._afterid, jsonData, callback)
        }else{
          console.log("callbackcalled", jsonData.entry.length, jsonData);
          callback(null,jsonData)
        }
      } catch(e) {
        console.log('error***********', new Date(), url, options)
      }
    }
    // if(!jsbody.link){
    //   callback(error, jsbody)
    // }
  })
}

//run getFhirResourceBundle for all the resources 


let endpointsToQuery = [
  {apiVersion: 'stu3', resourceType: 'Patient'},
  {apiVersion: 'stu3', resourceType: 'Coverage'},
  {apiVersion: 'stu3', resourceType: 'ExplanationOfBenefit'},
  {apiVersion: 'stu3', resourceType: 'ReferralRequest'},
  {apiVersion: 'dstu2', resourceType: 'Patient'},
  {apiVersion: 'dstu2', resourceType: 'Encounter'},
  {apiVersion: 'dstu2', resourceType: 'Observation'},
  {apiVersion: 'dstu2', resourceType: 'MedicationOrder'},
  {apiVersion: 'stu3', resourceType: 'MedicationDispense'},
  {apiVersion: 'stu3', resourceType: 'MedicationStatement'},
  {apiVersion: 'stu3', resourceType: 'MedicationOrder'},
  {apiVersion: 'dstu2', resourceType: 'Condition'},
  {apiVersion: 'dstu2', resourceType: 'AllergyIntolerance'}
]

function getAllFhirResourceBundles (oneupAccessToken, callback) {
  var jsbody;
  let responseData = {}
  async.map(
    endpointsToQuery,
    function(params, asyncMapCallback){
      getFhirResourceBundle(params.apiVersion, params.resourceType, oneupAccessToken, afterid="0", jsonData = {},function (error, body) {
        if(error){
          asyncMapCallback(error, null)
        } else {
          try{
            if(typeof body){
              jsbody = body
            }else{
              jsbody = JSON.parse(body)
            }
            if (typeof responseData[params.resourceType] === 'undefined') {
              responseData[params.resourceType] = jsbody
            } else {
              responseData[params.resourceType].entry = responseData[params.resourceType].entry.concat(jsbody.entry)
            }
            asyncMapCallback(null, responseData)
          } catch(e) {
            console.log('error in getFhirResourceBundle', e)
          }
        }
      })
    },
    function(error, body){
      console.log('hello this is responseData', responseData)
      if(error){
        callback(error)
      } else {
        callback(responseData)
      }
    }
  )
}


exports.accessTokenCache = accessTokenCache
exports.getOrMakeOneUpUserId = getOrMakeOneUpUserId
exports.getFhirResourceBundle = getFhirResourceBundle
exports.getAllFhirResourceBundles = getAllFhirResourceBundles