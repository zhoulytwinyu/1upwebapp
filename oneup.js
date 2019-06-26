// utilities to interface with the 1uphealth api servers side
const request = require('request');
const async = require('async');

// environmental variables
const ONEUP_DEMOWEBAPPLOCAL_CLIENTID = process.env.ONEUP_DEMOWEBAPPLOCAL_CLIENTID;
const ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET = process.env.ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET;

// create storage cache for access tokens
let accessTokenCache = {};

// API base URLs for use throughout
const ROOT_API_URL = `https://api.1up.health`;
const USER_API_URL = `https://api.1up.health`;
const FHIR_API_URL = `https://api.1up.health/fhir`;

// run in debug mode?
const DEBUG = true;

/** 
 * getTokenFromAuthCode() fetches an access token given an
 * auth code and then executes a callback using that
 * access token.
 */
function getTokenFromAuthCode(code, callback) {
  let postUrl = `${ROOT_API_URL}/fhir/oauth2/token?client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}&code=${code}&grant_type=authorization_code`;

  // request access token using auth code
  request.post(postUrl, (error, response, body) => {
    if (error) {
      console.log('(getTokenFromAuthCode) Error:', error);
    }
    try {
      let jsbody = JSON.parse(body);
      debug_response(response.statusCode, postUrl, jsbody, 'getTokenFromAuthCode');
      // NEVER send the body.refresh_token client side!
      // This access token must be refreshed after 2 hours.
      callback(jsbody.access_token);
    } catch (error) {
      // the auth code may take a second to register, so we can try again
      console.log('[ERR] (getTokenFromAuthCode) Parse error:', error);
      console.log(`Body: ${JSON.stringify(body, null, 2)}\n`);
    }
  })
}

/**
 * getAuthCodeForExistingUser() fetches an auth code for
 * an existing app user ID (e.g. email address) and then 
 * executes a callback
 */
function getAuthCodeForExistingUser(email, callback) {
  let postUrl = `${ROOT_API_URL}/user-management/v1/user/auth-code?app_user_id=${email}&client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}`;
  
  // request auth code for existing user
  request.post(postUrl, (error, response, body) => {
    if (error) {
      console.log('[ERR] (getAuthCodeForExistingUser):', error);
    }
    let jsbody = JSON.parse(body);
    debug_response(response.statusCode, postUrl, jsbody, 'getAuthCodeForExistingUser');
    getTokenFromAuthCode(jsbody.code, (access_token) => {
      accessTokenCache[email] = access_token;
      // do something with the 1up user ID
      callback(jsbody.oneup_user_id);
    })
  })
}

/** 
 * createOneUpUser() creates a new 1upHealth user for
 * a given app user ID (e.g. email address) and then 
 * executes a callback.
 */ 
function createOneUpUser(email, callback) {
  let postUrl = `${USER_API_URL}/user-management/v1/user?app_user_id=${email}&client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}`;
  // POST the create user request
  request.post(postUrl, (error, response, body) => {
    if (error) {
      console.log('[ERR] (createOneUpUser) error POSTing to 1up user-management:', error);
      callback();
    } else {
      let jsbody = JSON.parse(body);
      debug_response(response.statusCode, postUrl, jsbody, 'createOneUpUser');
      // check if this user already exists in the app's database
      if (jsbody.error === "this user already exists") {
        if (DEBUG) {
          console.log(`[WARN] User ID ${email} already exists. Getting auth code for this user...`);
        }
        getAuthCodeForExistingUser(email, callback);
      } else {
        if (DEBUG) {
          console.log(`Successfully created user ${email}. Fetching their access token...`);
        }
        // get the access token for this user and execute the callback
        getTokenFromAuthCode(jsbody.code, (access_token) => {
          accessTokenCache[email] = access_token;
          callback(jsbody.oneup_user_id);
        })
      }
    }
  })
}

/**
 * getOneUpUserId() gets the 1upHealth user ID for a given
 * app user ID (e.g. email address) and then executes a callback.
 */
function getOneUpUserId(email, callback) {
  let getUrl = `${USER_API_URL}/user-management/v1/user?client_id=${ONEUP_DEMOWEBAPPLOCAL_CLIENTID}&client_secret=${ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET}&app_user_id=${email}`;
  // GET the requested user ID
  request.get(getUrl, (error, response, body) => {
    if (error) {
      console.log('[ERR] (getOneUpUserId):', error);
    }
    let jsbody = JSON.parse(body);
    debug_response(response.statusCode, getUrl, jsbody, 'getOneUpUserId');
    callback(jsbody.oneup_user_id);
  })
}

/**
 * getOrMakeOneUpUserId() is a wrapper for getOneUpUserId() that
 * creates a new user if the requested one does not exist yet and
 * then executes a callback.
 */
function getOrMakeOneUpUserId(email, callback) {
  // try to get this user's 1upHealth user ID
  getOneUpUserId(email, (oneupUserId) => {
    if (typeof oneupUserId === 'undefined' || typeof accessTokenCache[email] === 'undefined') {
      // if the user doesn't exist, create it and then execute the callback
      if (DEBUG) {
        console.log(`(getOrMakeOneUpUserId) User ${email} didn't exist. Creating it...`);
      }
      createOneUpUser(email, (oneupUserId) => { callback(oneupUserId) });
    } else {
      // if the user already exists, execute the callback immediately
      if (DEBUG) {
        console.log(`(getOrMakeOneUpUserId) User ${email} (1up ID: ${oneupUserId}) already exists.`);
      }
      callback(oneupUserId);
    }
  })
}

/**
 * getFhirResourceBundle() fetches a FHIR resource bundle
 * for a given user (access token) and then executes a callback.
 */
function getFhirResourceBundle(apiVersion, resourceType, oneupAccessToken, callback) {
  let getUrl = `${FHIR_API_URL}/${apiVersion}/${resourceType}`
  let options = {
    url: getUrl,
    headers: {
      Authorization: `Bearer ${oneupAccessToken}`
    }
  }
  // GET the FHIR resource
  request.get(options, (error, response, body) => {
    if (error) {
      console.log('[ERR] (getFhirResourceBundle):', error);
    }
    debug_response(response.statusCode, getUrl, JSON.parse(body), 'getFhirResourceBundle', false);
    callback(error, body);
  })
}

/**
 * getAllFhirResourceBundles() asyncronously fetches all FHIR resource 
 * bundles for a given user (access token) and then executes a callback.
 */
function getAllFhirResourceBundles(oneupAccessToken, callback) {
  let responseData = {};
  let endpointsToQuery = [
    { apiVersion: 'stu3',  resourceType: 'Patient' },
    { apiVersion: 'stu3',  resourceType: 'Coverage' },
    { apiVersion: 'stu3',  resourceType: 'ExplanationOfBenefit' },
    { apiVersion: 'stu3',  resourceType: 'ReferralRequest' },
    { apiVersion: 'dstu2', resourceType: 'Patient' },
    { apiVersion: 'dstu2', resourceType: 'Encounter' },
    { apiVersion: 'dstu2', resourceType: 'Observation' },
    { apiVersion: 'dstu2', resourceType: 'MedicationOrder' },
    { apiVersion: 'stu3',  resourceType: 'MedicationDispense' },
    { apiVersion: 'stu3',  resourceType: 'MedicationStatement' },
    { apiVersion: 'stu3',  resourceType: 'MedicationOrder' },
    { apiVersion: 'dstu2', resourceType: 'Condition' },
    { apiVersion: 'dstu2', resourceType: 'AllergyIntolerance' }
  ];
  async.map(
    endpointsToQuery,
    (params, callback) => {
      getFhirResourceBundle(params.apiVersion, params.resourceType, oneupAccessToken, (error, body) => {
        if (error) {
          callback(error)
        } else {
          try {
            let jsbody = JSON.parse(body);
            if (typeof responseData[params.resourceType] === 'undefined') {
              responseData[params.resourceType] = jsbody
            } else {
              responseData[params.resourceType].entry = responseData[params.resourceType].entry.concat(jsbody.entry)
            }
            callback(null, jsbody)
          } catch (e) {
            console.log('[ERR] (getAllFhirResourceBundles):', e)
          }
        }
      })
    },
    (error, body) => { callback(error ? error : responseData) }
  )
}

/**
 * debug_response() prints the status code, URL, and body content 
 * of a response along with an optional title. It is purely
 * meant to assist with debugging. The `pretty` argument indicates
 * whether or not to pretty-print the JSON response body.
 */
function debug_response(status_code, url, body, title='', pretty=true) {
  if (!DEBUG) return;
  console.log(`----- ${title}[${status_code}] -----`)
  console.log(`URL: ${url}`)
  console.log(`Response body: ${JSON.stringify(body, null, pretty ? 2 : 0)}\n`)
}

exports.accessTokenCache = accessTokenCache
exports.getOrMakeOneUpUserId = getOrMakeOneUpUserId
exports.getFhirResourceBundle = getFhirResourceBundle
exports.getAllFhirResourceBundles = getAllFhirResourceBundles