import Link from 'next/link'
import Page from '../../components/page'
import Layout from '../../components/layout'

export default class extends Page {
  render() {
    return (
      <Layout session={this.props.session} navmenu={false}>
        <div className="text-center pt-5 pb-5">
          <h1 className="display-4">Unauthorized</h1>
          <p className="lead">You are not authorized for this content.</p>
          <p className="lead"><Link href="/auth/signin"><a>Signin.</a></Link></p>
        </div>
      </Layout>
    )
  }
}
