# 1up Health Demo Web Application
Example web application built using 1upHealth FHIR, User &amp; Connect APIs

## Quickstart
1. Add your API keys to app server session, ex. `vim ~/.bashrc`
```
export ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET="clientsecretclientsecret"
export ONEUP_DEMOWEBAPPLOCAL_CLIENTID="clientidclientid"
```
2. Update the app configuration with the same client_id to `config.json`
3. Install & run the app
```
npm install
npm run dev
```
4. Run the email server
```
sudo python -m smtpd -n -c DebuggingServer localhost:25
```

## Optional Setup: Setup email using actual email (relay) server
Either run a test local server for development
```
sudo python -m smtpd -n -c DebuggingServer localhost:25
```
Or setup email js for production in `auth.js`
```
var email 	= require("emailjs");
var server 	= email.server.connect({
   user:    "username",
   password:"password",
   host:    "smtp.your-email.com",
   ssl:     true
});
```
