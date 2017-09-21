import React from 'react'

export default class FhirCondition extends React.Component {

  render () {
    return (
      <div className='tile'>
        <h2 className='primarycolor' style={{display: 'inline-block'}}>
          {this.props.resource.code && this.props.resource.code.coding ? <span>{this.props.resource.code.coding[0].display} {this.props.resource.code.coding[0].code}</span> : this.props.resource.code.text}
        </h2>
        &nbsp;&nbsp;&nbsp;
        <h3 style={{display: 'inline-block'}}>{this.props.resource.verificationStatus} & {this.props.resource.clinicalStatus}</h3>
        <table>
          <tbody>
            {this.props.resource.onsetDateTime ? (
              <tr>
                <td><strong>Onset</strong></td>
                <td>{this.props.resource.onsetDateTime.slice(0,10)}</td>
              </tr>
            ) : ''}
            {typeof this.props.resource.asserter !== 'undefined' ? (
              <tr>
                <td><strong>Diagnosed by</strong></td>
                <td>{this.props.resource.asserter.display}</td>
              </tr>
            ) : ''}
          </tbody>
        </table>
      </div>
    )
  }
}
