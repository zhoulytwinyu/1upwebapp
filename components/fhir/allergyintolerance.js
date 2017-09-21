import React from 'react'

export default class FhirAllergyIntolerance extends React.Component {

  render () {
    return (
      <div className='tile'>
        <h2 className='primarycolor' style={{display: 'inline-block'}}>
          {this.props.resource.substance && this.props.resource.substance.coding ? <span>{this.props.resource.substance.coding[0].display} {this.props.resource.substance.coding[0].code}</span> : this.props.resource.substance.text}
        </h2>
        &nbsp;&nbsp;&nbsp;
        <h3 style={{display: 'inline-block'}}>{typeof this.props.resource.substance.coding === 'undefined' ? '' : this.props.resource.substance.coding[0].system}</h3>
        <table>
          <tbody>
            {typeof this.props.resource.reaction === 'undefined' ? '' : (
              <tr>
                <td><strong>Reaction</strong></td>
                <td>{this.props.resource.reaction[0].manifestation.map(function(manifestation){return manifestation.text})}</td>
              </tr>
            )}
            { typeof this.props.resource.onset === 'undefined' ? '' : (
              <tr>
                <td><strong>Onset</strong></td>
                <td>{this.props.resource.onset.slice(0,10)}</td>
              </tr>
              )
            }
          </tbody>
        </table>
      </div>
    )
  }
}
