import Link from 'next/link'

export default class FhirResourceJson extends React.Component {
  constructor () {
    super();
  }

  render() {
    return (
      <div className='bg-light card mb-3'>
        <div class="card-header">{this.props.fhirResource.resource.resourceType}</div>
        <div class="card-body">
          <code>
            <pre>
              {JSON.stringify(this.props.fhirResource, null, 2)}
            </pre>
          </code>
        </div>
      </div>
    )
  }
}
