import React from 'react'
import { authenticate, logout, logoutEvent } from '../utils'
import Header from '../components/header.js'

export default class Timeline extends React.Component {
  static async getInitialProps ({ req, res }) {
    const user = await authenticate(req, res)
    return { user }
  }

  render () {
    return (
      <div>
        <Header user={this.props.user} />
        <p>This is your timeline <strong>{this.props.user}</strong></p>
        <style jsx>{`
          div {
            text-align: center;
          }
        `}</style>
      </div>
    )
  }
}
