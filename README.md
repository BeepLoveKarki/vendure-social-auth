# Vendure Social Auth

A community plugin for [Vendure E-Commerce](https://www.vendure.io/) that allows authentication with your Vendure server via client-side tokens, issued from Google or Facebook.

[![Build Status](https://travis-ci.com/FlushBG/vendure-social-auth.svg?branch=master)](#)
[![Coverage Status](https://coveralls.io/repos/github/FlushBG/vendure-social-auth/badge.svg?branch=master)](#)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](#) 

## Table of Contents

* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Configuration](#configuration)
* [GraphQL Extensions](#graphql-extensions)
* [Entities](#entities)
* [Admin UI Extensions](#admin-ui-extensions)
* [Error Handling](#error-handling)
* [License](#license)

## Prerequisites

Vendure Social Auth uses authentication tokens, issued on the client using the [Google Sign-In SDK](https://developers.google.com/identity/sign-in/web/sign-in) or the [Facebook Javascript SDK](https://developers.facebook.com/docs/javascript/). On the frontend, you have to guide the user through your application's authentication process, get their consent, and retrieve an access token before you can pass it to the plugin.

## Installation
1. If you haven't already, create your server as described in Vendure's [official docs](https://www.vendure.io/docs/getting-started/)

2. Install the package using [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com) package manager:

```sh
npm install @glarus-labs/vendure-social-auth
```
```sh
yarn add @glarus-labs/vendure-social-auth
```

3. In your `vendure-config.ts` file, initialize the `SocialAuthPlugin` plugin inside the `VendureConfig` object's plugin array:

```typescript
import { SocialAuthPlugin } from '@glarus-labs/vendure-social-auth';

export const config: VendureConfig = {
    plugins: [
       SocialAuthPlugin.init({
            google: {
                strategyName: 'google',
                clientId: 'xxxx'
            },
            facebook: {
                strategyName: 'facebook',
                apiVersion: 'v6.0',
                appId: 'xxxx',
                appSecret: 'xxxx',
            }
        }) 
    ]
}
```

## Configuration
The plugin's `init` function is configured using the `SocialAuthPluginOptions` interface:
```typescript
export interface SocialAuthPluginOptions {
    google: {
        /** The Google strategy name your resolver will expect.
         *  Optional. Default value: 'google'
         */
        strategyName?: string; 
        /** The client id issued by your Google application. */
        clientId: string;
    },
    facebook: {
        /** The Facebook strategy name your resolver will expect.
         *  Optional. Default value: 'facebook'
         */
        strategyName?: string;
        /** The Facebook GraphAPI version the plugin will use.
         *  Format: 'vX.X'
         *  Optional. Default value: 'v6.0'
         */
        apiVersion?: string;
        /** The app id issued by your Facebook application. */
        appId: string;
        /** The app secret issued by your Facebook application. */
        appSecret: string;
    }
}
```

## GraphQL Extensions
The current version of Vendure Social Auth extends the existing schema with a new mutation:

### loginExternal
```graphql
loginExternal(strategy: String!, token: String!): LoginResult!
```
The resolver for this mutation verifies the received token's validity with Google and Facebook's servers, and checks the database for a [User](https://www.vendure.io/docs/typescript-api/entities/user/) with an identifier, matching the token. A new [User](https://www.vendure.io/docs/typescript-api/entities/user/) - [Customer](https://www.vendure.io/docs/typescript-api/entities/customer/) pair is created, if a match is not found. An authenticated [Session](https://www.vendure.io/docs/typescript-api/entities/session/) is created for the user.

Parameters:
* *strategy* - [String!](https://www.vendure.io/docs/graphql-api/shop/object-types/#string) - Depending on the type of social login (Google or Facebook), pass one of the strategy name you defined in the plugin Configuration.
* *token* - [String!](https://www.vendure.io/docs/graphql-api/shop/object-types/#string) - The token you received after completing the Prerequisites

Return type: [LoginResult!](https://www.vendure.io/docs/graphql-api/shop/object-types/#loginresult)

## Entities
The current version of Vendure Social Auth does not include new entities or updates to existing ones.

## Admin UI Extensions
The current version of Vendure Social Auth does not include Admin UI extensions.

## Error Handling
// TODO

## License

Vendure Social Auth is licensed under the [MIT](#) license.  
Copyright &copy; 2020, FlushBG



 

