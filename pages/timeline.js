import React from 'react'
import fetch from 'isomorphic-fetch'
import { authenticate, logout, logoutEvent } from '../utils'
import Header from '../components/header.js'

export default class Timeline extends React.Component {
  static async getInitialProps ({ req, res }) {
    const user = await authenticate(req, res)
    if (typeof req === 'undefined'){
      let timeline = await fetch(
        `http://localhost:3000/api/timeline`,
        {credentials: 'include'}
      ).then(r=>r.json());
      return { timeline, user }
    } else {
      let authHeader = {
        'Authorization': 'Bearer ' + req.session.oneup_access_token
      }
      let timeline = await fetch(
        `http://localhost:3000/api/timeline`,
        {headers: authHeader}
      ).then(r=>r.json());
      return { timeline, user }
    }
  }

  componentDidMount () {
    if (this.props.user) {
      try {
        window.localStorage.setItem('email', this.props.user.email)
        window.localStorage.setItem('oneup_access_token', this.props.user.oneup_access_token)
      } catch (err) {}
    } else {
      window.localStorage.remove('email')
      window.localStorage.remove('oneup_access_token')
    }
  }

  render () {
    return (
      <div>
        <Header user={this.props.user} />
        <p>This is your timeline <strong>{this.props.user.email}</strong></p>
        <div>
          {JSON.stringify(this.props.timeline)}
        </div>
        <style jsx>{`
          div {
            text-align: center;
          }
        `}</style>
      </div>
    )
  }
}
