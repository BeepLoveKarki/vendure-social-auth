import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import {
	FACEBOOK_PROFILE_URL,
	FACEBOOK_TOKEN_DEBUG_URL,
	SOCIAL_AUTH_PLUGIN_OPTIONS,
} from '../constants';
import { ExternalProfileData, SocialAuthPluginOptions } from '../types';

interface FBDebugTokenResponse {
	app_id: string;
	type: string;
	application: string;
	data_access_expires_at: number;
	expires_at: number;
	is_valid: boolean;
	scopes: string[];
	user_id: string;
}

@Injectable()
export class FacebookVerificationService {
	private baseUrl: string;
	private appToken: string;

	constructor(
		@Inject(SOCIAL_AUTH_PLUGIN_OPTIONS)
		private options: SocialAuthPluginOptions
	) {
		// TODO: Get app token dynamically per request for extra security?
		this.appToken = `${options.facebook.appId}|${options.facebook.appSecret}`;
		this.baseUrl = `https://graph.facebook.com/${options.facebook.apiVersion}`;
	}

	async verify(token: string): Promise<ExternalProfileData> {
		// TODO: Implement an adequate try-catch
		try {
			const debugResponse = await axios.get<FBDebugTokenResponse>(
				this.getDebugUrl(token, this.appToken)
			);
			const payload = debugResponse.data;

			// TODO: Extra token validations (expiry date, returned app Id vs app Id from options, granted email scope and public_profile scope)
			if (!payload.is_valid) {
				// error
			}
			
			const profileResponse = await axios.get(this.getProfileUrl(token));

			const profileData: ExternalProfileData = {
				id: profileResponse.data.id,
				email: profileResponse.data.email,
				firstName: profileResponse.data.first_name || '',
				lastName: profileResponse.data.last_name || '',
			};

			return profileData;
		} catch (err) {
			return Promise.reject(err.response.data);
		}
	}

	private getDebugUrl(inputToken: string, accessToken: string): string {
		return FACEBOOK_TOKEN_DEBUG_URL.replace('{{baseUrl}}', this.baseUrl)
			.replace('{{inputToken}}', inputToken)
			.replace('{{accessToken}}', accessToken);
	}

	private getProfileUrl(accessToken: string): string {
		return FACEBOOK_PROFILE_URL.replace(
			'{{baseUrl}}',
			this.baseUrl
		).replace('{{accessToken}}', accessToken);
	}
}
