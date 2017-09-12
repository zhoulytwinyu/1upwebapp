import React from 'react'
import Link from 'next/link'
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
      <div>
        <Link href='/'>home</Link>
        <strong>{
          typeof this.props.user === 'undefined' ?
          <Link href='/login'>Login</Link> :
          (<span><span>{this.props.user}</span> <a href='/logout' onClick={logout}>logout</a></span>)}</strong>
      </div>
    )
  }
}
