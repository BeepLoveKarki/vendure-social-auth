import { VendurePlugin, Type } from '@vendure/core';
import { SocialAuthOptions } from "./types";
import { PLUGIN_OPTIONS } from './constants';

@VendurePlugin({
    providers: [
        {
            provide: PLUGIN_OPTIONS,
            useFactory: () => SocialAuthPlugin.options
        },
    ],
})
export class SocialAuthPlugin {
    private static options: SocialAuthOptions;

    static init(options: SocialAuthOptions): Type<SocialAuthPlugin> {
        SocialAuthPlugin.options = options;
        return this;
    }
}