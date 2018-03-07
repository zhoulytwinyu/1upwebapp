# 1up Health Demo Web Application
Example web application built using 1upHealth FHIR, User &amp; Connect APIs
When you create an application via the 1uphealth devconsole for testing purposes use `http://localhost:3000/callback` for your app's callback url.

## Quickstart
1. Checkout source code from the repo
```
cd ~/
git clone https://github.com/1uphealth/1upwebapp.git
```


2. Add your API keys to app server session, ex. `vim ~/.bashrc`
```
export ONEUP_DEMOWEBAPPLOCAL_CLIENTSECRET="clientsecretclientsecret"
export ONEUP_DEMOWEBAPPLOCAL_CLIENTID="clientidclientid"
```

3. Create `config.json` configuration file with the same client_id
```
{
  "baseURL": "http://localhost:3000",
  "clientId": "xxxxxxx",
  "__clientId": "the client id must be hardcoded here because this will be client side",
  "email": {
    "sender": "address@demo.com"
  }
}
```

4. Install & run the app
```
npm install
npm run dev
```

5. Run the email server
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
