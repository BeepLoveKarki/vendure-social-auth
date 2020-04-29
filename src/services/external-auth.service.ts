import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
	AuthenticatedSession,
	Customer,
	normalizeEmailAddress,
	RequestContext,
	RoleService,
	User,
} from '@vendure/core';
import { Connection } from 'typeorm';
import { SOCIAL_AUTH_PLUGIN_OPTIONS } from '../constants';
import { ExternalProfileData, SocialAuthPluginOptions } from '../types';
import { FacebookVerificationService } from './facebook-verification.service';
import { GoogleVerificationService } from './google-verification.service';
import { SessionUtilsService } from './session-utils.service';

@Injectable()
export class ExternalAuthService {
	constructor(
		@InjectConnection() private connection: Connection,
		@Inject(SOCIAL_AUTH_PLUGIN_OPTIONS)
		private options: SocialAuthPluginOptions,
		private sessionUtilsService: SessionUtilsService,
		private roleService: RoleService,
		private googleService: GoogleVerificationService,
		private facebookService: FacebookVerificationService
	) {}

	async authenticate(ctx: RequestContext, strategy: string, token: string) {
		// TODO: Implement event bus events
		let profileData: ExternalProfileData;
		switch (strategy) {
			case this.options.google.strategyName:
				profileData = await this.googleService.verify(token);
				break;
			case this.options.facebook.strategyName:
				profileData = await this.facebookService.verify(token);
				break;
			default:
				throw new Error('Authentication strategy is not supported!');
		}

		let user = await this.getUserByIdentifier(profileData.id);
		if (!user) {
			user = await this.createExternalUser(profileData);
		}

		if (ctx.session && ctx.session.activeOrder) {
			await this.sessionUtilsService.deleteSessionsByActiveOrder(
				ctx.session && ctx.session.activeOrder
			);
		}

		const session = await this.sessionUtilsService.createNewAuthenticatedSession(
			ctx,
			user
		);
		const newSession = await this.connection
			.getRepository(AuthenticatedSession)
			.save(session);

		return newSession;
	}

	private async getUserByIdentifier(
		identifier: string
	): Promise<User | undefined> {
		const user = await this.connection.getRepository(User).findOne({
			where: { identifier },
			relations: ['roles', 'roles.channels'],
		});

		return user;
	}

	private async createExternalUser(
		profileData: ExternalProfileData
	): Promise<User> {
		const customer = new Customer({
			emailAddress: normalizeEmailAddress(profileData.email),
			firstName: profileData.firstName,
			lastName: profileData.lastName,
		});

		const user = new User({
			identifier: profileData.id,
			// TODO: Some salted password hash / uuid, that makes sure it is inaccessible via login?
			passwordHash: '',
			verificationToken: null,
			verified: true,
		});

		const customerRole = await this.roleService.getCustomerRole();
		user.roles = [customerRole];
		customer.user = user;

		const result = await this.connection.getRepository(User).save(user);
		await this.connection.getRepository(Customer).save(customer);

		return result;
	}
}
