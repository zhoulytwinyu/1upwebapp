# 1up Health Demo Web Application
Example web application built using 1upHealth FHIR, User &amp; Connect APIs

## Quickstart
Add your API keys
```
export ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET="clientsecretclientsecret"
export ONEUP_DEMOWEBAPPLOCAL_CLIENTID="clientidclientid"
```

Run the app
```
npm install
npm run dev
```
Run the email server
```
sudo python -m smtpd -n -c DebuggingServer localhost:25
```

## Setup email
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
