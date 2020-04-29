export interface SocialAuthPluginOptions {
    google: {
        strategyName?: string;
        clientId: string;
    },
    facebook: {
        strategyName?: string;
        apiVersion?: string;
        appId: string;
        appSecret: string;
    }
}

export type ExternalLoginMutationArgs = {
    strategy: string;
    token: string;
}

export type ExternalProfileData = {
    id: string, 
    email: string, 
    firstName: string,
    lastName: string
};