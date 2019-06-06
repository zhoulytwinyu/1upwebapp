import React from 'react'
import Link from 'next/link'
import Layout from "../components/layouts/Layout"
import Header from '../components/Header.js'
import {Fancy, TodoList, Patient, Resources} from 'fhir-react'
import dstu2Encounter from '../tests/fixtures/dstu2/Encounter.json'
import dstu2Patient from '../tests/fixtures/dstu2/Patient.json'

export default class Home extends React.Component {
  render () {
    return (
      <Layout>
        <Header user={this.props.user} />
        <div className='container'>
          <h1>{`Testing`}</h1>
          <Resources.Patient jsonOpen={true} fhirResource={dstu2Patient.entry[0].resource} thorough={false}/>
          {dstu2Encounter.entry.map(function(Encounter){
            return JSON.stringify(dstu2Encounter, null, 2)
          })}
        </div>
      </Layout>
    )
  }
}
