import React from 'react'
import FhirElementTelecom from './elements/telecom.js'
import FhirElementAddress from './elements/address.js'

export default class FhirPatient extends React.Component {

  render () {
    return (
      <div className='tile'>
        <h2 className='primarycolor' style={{display: 'inline-block'}}>
          {this.props.resource.name[0].given[0]} {this.props.resource.name[0].family[0]}
        </h2>
        &nbsp;&nbsp;&nbsp;
        <h3 style={{display: 'inline-block'}}>{this.props.resource.gender} ({this.props.resource.birthDate.slice(0,10)}) MRNs: {this.props.resource.identifier.map(function(identifier){return `${identifier.value}, `})}</h3>
        <table>
          <tbody>
            {typeof this.props.resource.telecom === 'undefined' ? '':
              (<tr>
                <td><strong>Contact</strong></td>
                <td>
                  {this.props.resource.telecom.map(function(telecom){
                    return <FhirElementTelecom {...telecom} />
                  })}
                </td>
              </tr>)
            }
            {typeof this.props.resource.address === 'undefined' ? '':
              (<tr>
                <td><strong>Address</strong></td>
                <td>
                  {this.props.resource.address.map(function(address){
                    return <FhirElementAddress {...address} />
                  })}
                </td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
    )
  }
}
