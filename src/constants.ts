import { SocialAuthPluginOptions } from "./types";

export const SOCIAL_AUTH_PLUGIN_OPTIONS = Symbol('PLUGIN_OPTIONS');
export const DEFAULT_AUTH_PLUGIN_OPTIONS: SocialAuthPluginOptions = {
    google: {
        strategyName: 'google',
        clientId: '',
    },
    facebook: {
        strategyName: 'facebook',
        apiVersion: 'v6.0',
        appId: '',
        appSecret: '',
    }
}

// TODO: Include locale=en_US to the query parameters or return the data in user's facebook language
export const FACEBOOK_PROFILE_URL = '{{baseUrl}}/me?fields=id,first_name,last_name,email&access_token={{accessToken}}';
export const FACEBOOK_TOKEN_DEBUG_URL = '{{baseUrl}}/debug_token?input_token={{inputToken}}&access_token={{accessToken}}';