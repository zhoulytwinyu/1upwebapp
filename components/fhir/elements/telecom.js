import React from 'react'

export default class FhirElementTelecom extends React.Component {

  render () {
    return (
      <div style={{display: 'inline-block', width: '12rem'}}>
        <div><a href={`${this.props.system === 'email' ? 'mailto:' : 'tel:'}${this.props.value}`}>{this.props.value}</a></div>
        {this.props.value ? (<div>({this.props.system}{this.props.use && this.props.system ? ' / ' : ''}{this.props.use})</div>) : ''}
      </div>
    )
  }
}
