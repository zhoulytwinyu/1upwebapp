import React from 'react'

export default class FhirElementAddress extends React.Component {

  render () {
    return (
      <div style={{display: 'inline-block', width: '24rem'}}>
        <div><strong>{this.props.use}</strong></div>
        {this.props.line ? (<div>{this.props.line.map(function(line){return line})}</div>) : ''}
        <div>{this.props.city}{this.props.city ? ',' : ''} {this.props.state} {this.props.postalCode} </div>
        <div>{this.props.country}</div>
      </div>
    )
  }
}
