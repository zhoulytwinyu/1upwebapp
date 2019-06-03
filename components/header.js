import React from 'react'
import Link from 'next/link'
import Head from 'next/head'

import { logout, logoutEvent } from '../utils'

export default class Header extends React.Component {
  componentDidMount () {
    this.onLogout = eve => logoutEvent(eve, this.props.url)
    window.addEventListener('storage', this.onLogout, false)
  }

  componentWillUnmount () {
    window.removeEventListener('storage', this.onLogout, false)
  }
  render () {
    return (
      <header>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <Link href='/'>Connect Data</Link>&nbsp;
          <strong>{
            typeof this.props.user === 'undefined' ?
            <Link href='/login'>Login</Link> :
            (<span><span>{this.props.user.email}</span> <a href='/logout' onClick={logout}>logout</a></span>)}
          </strong>

          <div className="collapse navbar-collapse" id="navbarsExampleDefault">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item active">
                <a className="nav-link" href="#"><strong>&#x25c0;</strong><span className="sr-only">(current)</span></a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    )
  }
}
