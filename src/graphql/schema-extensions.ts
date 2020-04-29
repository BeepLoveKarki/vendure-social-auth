import { gql } from 'apollo-server-core';

export const apiExtensions = gql`
    extend type Mutation {
        loginExternal(strategy: String!, token: String!): LoginResult!
    }
`;