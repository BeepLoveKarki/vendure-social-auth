import { Inject, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { SOCIAL_AUTH_PLUGIN_OPTIONS } from '../constants';
import { ExternalProfileData, SocialAuthPluginOptions } from '../types';

@Injectable()
export class GoogleVerificationService {
	private client: OAuth2Client;

	constructor(
		@Inject(SOCIAL_AUTH_PLUGIN_OPTIONS)
		private options: SocialAuthPluginOptions
	) {
		this.client = new OAuth2Client(this.options.google.clientId);
	}

	async verify(token: string): Promise<ExternalProfileData> {
		// TODO: Implement adequate error handling (custom plugin error?)
		const ticket = await this.client.verifyIdToken({
			idToken: token,
			audience: this.options.google.clientId,
		});

		const payload = ticket.getPayload();
		if (!payload) {
			// error
		}

		const authenticatedPayload = payload!;
		if (
			!authenticatedPayload.email ||
			!authenticatedPayload.email_verified
		) {
			// error for email
		}

		const profileData: ExternalProfileData = {
			id: authenticatedPayload.sub,
			email: authenticatedPayload.email!,
			firstName: authenticatedPayload.given_name || '',
			lastName: authenticatedPayload.family_name || '',
		};

		// TODO: Validate 'nonce' property

		return profileData;
	}
}
