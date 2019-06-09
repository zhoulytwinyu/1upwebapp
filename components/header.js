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
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <a class="navbar-brand" href="https://1up.health/dev">1upHealth</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggsler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              { (typeof this.props.user === 'undefined' || this.props.user.email === "null") ?
                '' : (<li class="nav-item">
                  <a class="nav-link"><Link href='/'>Connect Data</Link>&nbsp; <span class="sr-only">(current)</span></a>
                </li>)
              }
              { (typeof this.props.user === 'undefined' || this.props.user.email === "null") ?
                <a class="nav-link" href=""><Link href='/login'>Login</Link></a> :
                (
                  <li class="nav-item">
                    <a class="nav-link" href=""><Link href='/logout' onClick={logout}>Logout</Link></a>
                  </li>
                )
              }
              { (typeof this.props.user === 'undefined' || this.props.user.email === "null") ?
                '' : (
                    <li class="nav-item">
                      <a class="nav-link" href=""><Link href='/dashboard'>{this.props.user.email}</Link></a>
                    </li>)
              }
              <li class="nav-item">
                <a class="nav-link" href=""><Link href='/test'>Test Data</Link>&nbsp; </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    )
  }
}
