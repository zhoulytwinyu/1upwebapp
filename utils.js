import Router from 'next/router'
import 'isomorphic-fetch'

export const authenticate = async (req, res) => {
  const user = req ? req.user : getAuthUser()
  if (user) {
    return user
  } else {
    req ? res.redirect('/login') : Router.push('/login')
    return null
  }
}

export const logoutEvent = (eve, url) => {
  if (eve.key === 'logout') {
    logout()
  }
}

export const logout = () => {
  console.log('clearinglocalstorage')
  window.localStorage.removeItem('user')
  window.localStorage.setItem('logout', new Date())
  window.fetch('/logout', { method: 'POST' })
  Router.push('/logout')
}

const getAuthUser = () => {
  try {
    return window.localStorage.getItem('user')
  } catch (err) {
    return null
  }
}
