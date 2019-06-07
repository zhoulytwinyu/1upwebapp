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
          <a class="navbar-brand" href="">1upHealth</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggsler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item active">
                <a class="nav-link" href=""><Link href='/'>Connect Data</Link>&nbsp; <span class="sr-only">(current)</span></a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="">{
                  typeof this.props.user === 'undefined' ?
                  <Link href='/login'>Login</Link> :
                  (<span><span>{this.props.user.email}</span> <a href='/logout' onClick={logout}>logout</a></span>)}</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href=""><Link href='/test'>Test</Link>&nbsp; </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    )
  }
}
