import { Inject, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { SOCIAL_AUTH_PLUGIN_OPTIONS } from '../constants';
import { ExternalProfileData, SocialAuthPluginOptions } from '../types';
import { UnauthorizedError } from '@vendure/core';
import { hasUnknownAppId, isExpired } from '../helpers/token-validation';

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
		const ticket = await this.client.verifyIdToken({
			idToken: token,
			audience: this.options.google.clientId,
		});

		const payload = ticket.getPayload();
		if (
			!payload ||
			hasUnknownAppId(this.options.google.clientId, payload.aud) ||
			isExpired(payload.exp) ||
			!payload.email ||
			!payload.email_verified
		) {
			throw new UnauthorizedError();
		}

		const authenticatedPayload = payload!;
		const profileData: ExternalProfileData = {
			id: authenticatedPayload.sub,
			email: authenticatedPayload.email!,
			firstName: authenticatedPayload.given_name || '',
			lastName: authenticatedPayload.family_name || '',
		};

		return profileData;
	}
}
