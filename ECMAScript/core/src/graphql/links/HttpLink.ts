import { HttpLink as ApolloHttpLink } from '@apollo/client/link/http'

import fetch from 'cross-fetch'

import { endpointGraphQL } from '../../../../config'

export const HttpLink = new ApolloHttpLink({
  uri: endpointGraphQL,
  fetch,
})

export default HttpLink