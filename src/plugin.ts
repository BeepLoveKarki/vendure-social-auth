import { VendurePlugin, Type, PluginCommonModule } from '@vendure/core';
import { SocialAuthOptions } from "./types";
import { PLUGIN_OPTIONS } from './constants';
import { schemaExtension, SocialAuthResolver } from './resolvers/social-auth.resolver';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [
        {
            provide: PLUGIN_OPTIONS,
            useFactory: () => SocialAuthPlugin.options
        },
    ],
    shopApiExtensions: {
        schema: schemaExtension,
        resolvers: [SocialAuthResolver]
    }
})
export class SocialAuthPlugin {
    private static options: SocialAuthOptions;

    static init(options: SocialAuthOptions): Type<SocialAuthPlugin> {
        SocialAuthPlugin.options = options;
        return this;
    }
}