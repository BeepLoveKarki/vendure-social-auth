import {
	PluginCommonModule,
	RuntimeVendureConfig,
	Type,
	VendurePlugin,
} from '@vendure/core';
import {
	DEFAULT_AUTH_PLUGIN_OPTIONS,
	SOCIAL_AUTH_PLUGIN_OPTIONS,
} from './constants';
import { apiExtensions } from './graphql/schema-extensions';
import { SocialAuthResolver } from './graphql/social-auth.resolver';
import {
	ExternalAuthService,
	FacebookVerificationService,
	GoogleVerificationService,
	SessionUtilsService,
} from './services';
import { SocialAuthPluginOptions } from './types';

@VendurePlugin({
	imports: [PluginCommonModule],
	providers: [
		{
			provide: SOCIAL_AUTH_PLUGIN_OPTIONS,
			useFactory: () => SocialAuthPlugin.options,
		},
		ExternalAuthService,
		GoogleVerificationService,
		FacebookVerificationService,
		SessionUtilsService,
	],
	shopApiExtensions: {
		schema: apiExtensions,
		resolvers: [SocialAuthResolver],
	},
	configuration: (config) => SocialAuthPlugin.configure(config),
})
export class SocialAuthPlugin {
	private static options: SocialAuthPluginOptions;

	static init(options: SocialAuthPluginOptions): Type<SocialAuthPlugin> {
		SocialAuthPlugin.options = {
			...DEFAULT_AUTH_PLUGIN_OPTIONS,
			...options,
		};
		return this;
	}

	static configure(config: RuntimeVendureConfig): RuntimeVendureConfig {
		// Any configuration goes here
		return config;
	}
}
