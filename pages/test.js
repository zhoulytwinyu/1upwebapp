import React from 'react'
import Link from 'next/link'
import Layout from "../components/layouts/Layout"
import Header from '../components/Header.js'
import DummyComponent from 'fhir-react'
import dstu2Encounter from '../tests/fixtures/dstu2Encounter.json'

export default class Home extends React.Component {
  render () {
    return (
      <Layout>
        <Header user={this.props.user} />
        <h1>{`Testing`}</h1>
        <DummyComponent />
        {JSON.stringify(dstu2Encounter, null, 2)}
      </Layout>
    )
  }
}
