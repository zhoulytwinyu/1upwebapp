import React from 'react'
import 'isomorphic-fetch'
import Header from '../components/Header.js'
import Layout from "../components/layouts/Layout"

export default class Login extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      submitted: false,
      email: ''
    }
  }

  onSubmit = e => {
    e.preventDefault()
    this.setState({
      submitted: true
    })

    window.fetch('/sendtoken', {
      method: 'POST',
      body: JSON.stringify({ user: this.state.email }),
      headers: new window.Headers({
        'Content-Type': 'application/json'
      })
    })
  }

  onEmailChange = e => {
    this.setState({
      email: e.target.value
    })
  }

  welcomeText = () => {
    return (
      <div className="col-sm-12 col-md-6">
        Welcome to the <a href='https://1up.health'>1upHealth</a> Demo App. You can sign in, connect your health systems, and view your medical record. Learn more about the tech behind this app in the <a href='https://github.com/1uphealth/1upwebapp'>git repo</a>.
        <br/>
        <br/>
      </div>
    )
  }

  render () {
    if (this.state.submitted) {
      return (
        <Layout>
          <Header />
          <div className="container">
            <br/>
            <br/>
            <div className="row">
              {this.welcomeText()}
              <div className="col-sm-12 col-md-6">
                <h3>Check your email. <br/>We sent a magic link to log into your account :)</h3>
              </div>
            </div>
          </div>
          <br/>
          <br/>
          <br/>
        </Layout>
      )
    }

    return (
      <Layout className="cent">
        <form onSubmit={this.onSubmit}>
          <Header />
          <div className="container">
            <br/>
            <br/>
            <div className="row">
              {this.welcomeText()}
              <div className="col-sm-12 col-md-6">
                <h3>Login using your email :)</h3>
                <input onChange={this.onEmailChange} value={this.state.email}
                  type='email' required placeholder='your@email.org' autoFocus />
                <input type='submit' value='Login' />
              </div>
            </div>
          </div>
        </form>
      </Layout>
    )
  }
}
