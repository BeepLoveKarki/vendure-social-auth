import { Query, Mutation, Args, Context, Resolver } from '@nestjs/graphql';
import { AuthService, Allow, Ctx, RequestContext, Permission } from '@vendure/core';
import { Request, Response} from 'express';
import gql from 'graphql-tag';

export const schemaExtension = gql`
extend type Query {
    getGreeting(name: String!): String!
}
`;

@Resolver()
export class SocialAuthResolver {
    
    @Query()
    @Allow(Permission.Public)
    async getGreeting(@Ctx() ctx: RequestContext, @Args() args: string) {
       const greeting = `Hello, ${args}! Have a great day!`;
       return greeting;
    }
}  